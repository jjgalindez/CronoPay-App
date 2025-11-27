import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { PagoWithRelations } from 'lib/api/pagos';
import { useTema } from '@/hooks/useTema';
import { PagoActions } from './PagoActions';

interface PagoCardProps {
  pago: PagoWithRelations;
  onMarkAsPaid: (pago: PagoWithRelations) => Promise<boolean>;
  onDelete: (pago: PagoWithRelations) => Promise<boolean>;
  loadingAction: string | null;
  isDark: boolean;
}

export const PagoCard: React.FC<PagoCardProps> = ({
  pago,
  onMarkAsPaid,
  onDelete,
  loadingAction,
  isDark,
}) => {
  const { t } = useTranslation();
  const isPaid = pago.estado === 'Pagado';

  const getPaymentStatusBadge = () => {
    if (isPaid) {
      return {
        text: t('Paid'),
        badgeStyle: (isDark ? styles.badgeStatusPaidDark : styles.badgeStatusPaid) as ViewStyle,
        textStyle: (isDark ? styles.badgeStatusTextPaidDark : styles.badgeStatusTextPaid) as TextStyle,
      };
    }
    return {
      text: t('Pending'),
      badgeStyle: (isDark ? styles.badgeStatusPendingDark : styles.badgeStatusPending) as ViewStyle,
      textStyle: (isDark ? styles.badgeStatusTextPendingDark : styles.badgeStatusTextPending) as TextStyle,
    };
  };

  const statusBadge = getPaymentStatusBadge();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={[
      styles.pagoCard,
      isDark ? styles.pagoCardDark : styles.pagoCardLight,
      isPaid && (isDark ? styles.pagoCardPaidDark : styles.pagoCardPaid)
    ]}>
      <View style={styles.pagoInfo}>
        <View style={styles.pagoHeader}>
          <Text
            style={[
              styles.pagoTitle,
              isDark ? styles.pagoTitleDark : styles.pagoTitleLight,
              isPaid && styles.pagoTitlePaid
            ]}
            numberOfLines={1}
          >
            {pago.titulo}
          </Text>
          <Text
            style={[
              styles.pagoAmount,
              isDark ? styles.pagoAmountDark : styles.pagoAmountLight,
              isPaid && styles.pagoAmountPaid
            ]}
          >
            {formatCurrency(Number(pago.monto) || 0)}
          </Text>
        </View>

        <View style={styles.pagoMetaRow}>
          <Text
            style={[
              styles.pagoCategory,
              isDark ? styles.pagoCategoryDark : styles.pagoCategoryLight,
              isPaid && styles.pagoCategoryPaid
            ]}
            numberOfLines={1}
          >
            {pago.categoria?.nombre || t('Uncategoryed')}
          </Text>

          <View style={styles.metaRight}>
            <View style={statusBadge.badgeStyle}>
              <Text style={statusBadge.textStyle}>
                {statusBadge.text}
              </Text>
            </View>

            <PagoActions
              pago={pago}
              onMarkAsPaid={onMarkAsPaid}
              onDelete={onDelete}
              loadingAction={loadingAction}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pagoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  pagoCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  pagoCardDark: {
    backgroundColor: '#171717',
    borderColor: '#404040',
  },
  pagoCardPaid: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    opacity: 0.7,
  },
  pagoCardPaidDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
    opacity: 0.7,
  },
  pagoInfo: {
    flex: 1,
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pagoTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  pagoTitleLight: {
    color: '#0a0a0a',
  },
  pagoTitleDark: {
    color: '#fafafa',
  },
  pagoTitlePaid: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  pagoAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagoAmountLight: {
    color: '#0a0a0a',
  },
  pagoAmountDark: {
    color: '#fafafa',
  },
  pagoAmountPaid: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  pagoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagoCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
    flex: 1,
    marginRight: 8,
  },
  pagoCategoryLight: {
    color: '#737373',
  },
  pagoCategoryDark: {
    color: '#a3a3a3',
  },
  pagoCategoryPaid: {
    textDecorationLine: 'line-through',
    color: '#a3a3a3',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeStatusPending: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusPendingDark: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusTextPending: {
    fontSize: 10,
    fontWeight: '600',
    color: '#c2410c',
  },
  badgeStatusTextPendingDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fb923c',
  },
  badgeStatusPaid: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusPaidDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusTextPaid: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  badgeStatusTextPaidDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4ade80',
  },
});