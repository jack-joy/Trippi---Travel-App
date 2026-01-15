import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ReactNode } from 'react';

interface SafeAreaWrapperProps {
  children: ReactNode;
  style?: any;
}

export const SafeAreaWrapper = ({ children, style }: SafeAreaWrapperProps) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
});

export default SafeAreaWrapper;
