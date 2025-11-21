// src/components/home/AppPreview.tsx
import React from "react"
import { Image, View, useWindowDimensions } from "react-native"
import SwiperFlatList from "react-native-swiper-flatlist"

const images = [
  require("@/assets/calendar.png"),
  require("@/assets/recorda.png"),
  require("@/assets/planes.png"),
]

const AppPreview = React.memo(() => {
  const { width } = useWindowDimensions()
  const imageHeight = width * 0.6 // Altura proporcional al ancho

  return (
    <View className="my-4 w-full" style={{ height: imageHeight }}>
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        showPagination
        data={images}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={{
              width: width - 32, // Full width menos padding horizontal (16px cada lado)
              height: imageHeight,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        )}
      />
    </View>
  )
})

AppPreview.displayName = "AppPreview"

export default AppPreview
