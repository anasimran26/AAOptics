import * as React from "react";
import { Dimensions, View, Image } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { fetchSliders } from "../api/index.js";

const BASE_URL = "https://optical.aasols.com";

function Carousal() {
  const progress = useSharedValue(0);
  const [sliders, setSliders] = React.useState([]);

  React.useEffect(() => {
    const getSliders = async () => {
      try {
        const slidersData = await fetchSliders();
        // console.log("Fetched sliders:", slidersData);
        setSliders(slidersData);
      } catch (error) {
        console.error("Error fetching sliders:", error);
      }
    };

    getSliders();
  }, []);

  if (!sliders.length) return null; 

  return (
    <View
      id="carousel-component"
      dataSet={{ kind: "basic-layouts", name: "parallax" }}
      // style={{ paddingBottom: 10 }}
    >
      <Carousel
        autoPlay
        autoPlayInterval={2000}
        data={sliders}
        height={Dimensions.get("window").width / 1.6}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        width={Dimensions.get("window").width}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.938,
          parallaxScrollingOffset: 35,
        }}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "transparent",
              borderRadius: 20,
            }}
          >
            <Image
              source={{ uri: `${BASE_URL}${item.image}` }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
}

export default Carousal;
