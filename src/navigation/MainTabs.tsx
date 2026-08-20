import FontAwesome from "@expo/vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { InvoicesScreen } from "@/screens/invoices/InvoicesScreen";
import { PatientsScreen } from "@/screens/patients/PatientsScreen";
import { VisitsScreen } from "@/screens/visits/VisitsScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Visits: undefined;
  Invoices: undefined;
};

const ACTIVE_COLOR = "#059669";
const INACTIVE_COLOR = "#64748b";
const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="home" size={size} />,
        }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="users" size={size} />,
        }}
      />
      <Tab.Screen
        name="Visits"
        component={VisitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="calendar-check-o" size={size} />,
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome color={color} name="file-text-o" size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
