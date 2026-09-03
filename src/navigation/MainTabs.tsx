import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { PatientsScreen } from "@/screens/patients/PatientsScreen";
import { PharmacyScreen } from "@/screens/pharmacy/PharmacyScreen";
import { VisitsScreen } from "@/screens/visits/VisitsScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Visits: undefined;
  Pharmacy: undefined;
};

type TabIconName = React.ComponentProps<typeof FontAwesome>["name"];
type TabItemProps = {
  icon: TabIconName;
  label: string;
  active: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

const ACTIVE_COLOR = "#ffffff";
const INACTIVE_COLOR = "#a6a1b5";
const INACTIVE_LABEL_COLOR = "#f8fafc";
const ACTIVE_BACKGROUND = "#059669";
const BAR_COLOR = "#171426";
const Tab = createBottomTabNavigator<MainTabParamList>();

function AnimatedTabItem({ icon, label, active, onPress, onLongPress, accessibilityLabel, testID }: TabItemProps) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, { damping: 17, stiffness: 190, mass: 0.7 });
  }, [active, progress]);

  const activeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 170, easing: Easing.out(Easing.quad) }),
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + progress.value * 0.04 }, { translateY: -1 * progress.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 1 }],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className="h-[60px] flex-1 items-center justify-center"
      testID={testID}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <Animated.View className="absolute inset-x-1 h-[54px] rounded-2xl" style={[activeStyle, { backgroundColor: ACTIVE_BACKGROUND }]} />
      <View className="z-10 w-full items-center justify-center">
        <Animated.View style={iconStyle}>
          <FontAwesome color={active ? ACTIVE_COLOR : INACTIVE_COLOR} name={icon} size={18} />
        </Animated.View>
        <Animated.Text
          className="mt-1 w-full px-0.5 text-center text-[9px] leading-[12px]"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.label, { color: active ? ACTIVE_COLOR : INACTIVE_LABEL_COLOR }, labelStyle]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

const ICONS: Record<keyof MainTabParamList, TabIconName> = {
  Dashboard: "home",
  Patients: "users",
  Visits: "calendar-check-o",
  Pharmacy: "medkit",
};

function ModernTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, 8);
  const barWidth = Math.min(width - 24, 440);

  return (
    <View style={[styles.safeArea, { paddingBottom: bottomInset }]}>
      <View style={[styles.tabBar, { width: barWidth }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const active = state.index === index;
          const routeName = route.name as keyof MainTabParamList;
          const label = typeof options.tabBarLabel === "string" ? options.tabBarLabel : options.title ?? route.name;

          function handlePress() {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          }

          return (
            <AnimatedTabItem
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              active={active}
              icon={ICONS[routeName]}
              label={label}
              testID={options.tabBarButtonTestID}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              onPress={handlePress}
            />
          );
        })}
      </View>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <ModernTabBar {...props} />} screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="home" size={size} /> }} />
      <Tab.Screen name="Patients" component={PatientsScreen} options={{ title: "Pasien", tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="users" size={size} /> }} />
      <Tab.Screen name="Visits" component={VisitsScreen} options={{ title: "Antrean", tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="calendar-check-o" size={size} /> }} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} options={{ title: "Farmasi", tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="medkit" size={size} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: "Poppins_600SemiBold" },
  safeArea: { alignItems: "center", backgroundColor: "transparent" },
  tabBar: { alignItems: "center", backgroundColor: BAR_COLOR, borderRadius: 18, elevation: 12, flexDirection: "row", height: 68, paddingHorizontal: 6, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 12 },
});
