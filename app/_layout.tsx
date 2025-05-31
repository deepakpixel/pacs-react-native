import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "Interest Calculator",
        headerStyle: {
          backgroundColor: '#3f51b5',
        },
        headerTintColor: '#fff',
      }}
    />
  );
}
