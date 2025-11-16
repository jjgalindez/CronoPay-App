// src/components/home/AppPreview.tsx
import { Image, View } from "react-native"
import SwiperFlatList from "react-native-swiper-flatlist"

const images = [
  require("@/assets/calendar.png"),
  require("@/assets/recorda.png"),
  require("@/assets/planes.png"),
]

export default function AppPreview() {
  return (
    <View className="h-[220px] w-full items-center">
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        showPagination
        data={images}
        renderItem={({ item }) => (
          <Image
            source={item}
            className="h-[200px] w-[200px] self-center rounded-xl"
            resizeMode="contain"
          />
        )}
      />
    </View>
  )
}
