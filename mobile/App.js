import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const tabs = ['Home', 'Categories', 'Help / Contact'];

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ExpoStatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Image source={require("./assets/logo.jpeg")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.eyebrow}>ADHESIVE · SANITARY · FITTINGS</Text>
          <Text style={styles.brand}>TYLO <Text style={styles.gold}>HOME</Text></Text>
          <Text style={styles.subtitle}>Thoughtful pieces for everyday spaces.</Text>
        </View>

        <View style={styles.content}>
          {activeTab === 'Home' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Your collection starts here.</Text>
              <Text style={styles.emptyCopy}>Products will appear here soon.</Text>
            </View>
          )}
          {activeTab === 'Categories' && (
            <View style={styles.emptyState}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.emptyCopy}>Browse product categories here soon.</Text>
            </View>
          )}
          {activeTab === 'Help / Contact' && (
            <View style={styles.emptyState}>
              <Text style={styles.sectionTitle}>Help & Contact</Text>
              <Text style={styles.emptyCopy}>Contact details and support will be added here.</Text>
            </View>
          )}
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const selected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab)}
                style={styles.tab}
              >
                <Text style={[styles.tabText, selected && styles.activeTabText]}>{tab}</Text>
                {selected && <View style={styles.activeMark} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090909' },
  page: { flex: 1, backgroundColor: '#090909', paddingHorizontal: 22 },
  header: { paddingTop: 38, paddingBottom: 26, borderBottomWidth: 1, borderBottomColor: '#4a3b20' },
  eyebrow: { color: '#d8b451', fontSize: 10, letterSpacing: 2, marginBottom: 12 },
  brand: { color: '#f5f5f5', fontSize: 29, fontWeight: '600', letterSpacing: -0.7 },
  logo: { width: 94, height: 94, marginBottom: 16, backgroundColor: "#090909" },
  gold: { color: "#f1cc69" },
  subtitle: { color: '#b4ada0', fontSize: 14, marginTop: 9 },
  content: { flex: 1, justifyContent: 'center' },
  emptyState: { paddingVertical: 30 },
  emptyTitle: { color: '#f5f5f5', fontSize: 21, fontWeight: '500', marginBottom: 9 },
  sectionTitle: { color: '#f5f5f5', fontSize: 23, fontWeight: '600', marginBottom: 9 },
  emptyCopy: { color: '#b4ada0', fontSize: 14, lineHeight: 21 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#4a3b20', paddingTop: 13, paddingBottom: 10 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  tabText: { color: '#a79d8a', fontSize: 12 },
  activeTabText: { color: '#f1cc69' },
  activeMark: { width: 16, height: 2, backgroundColor: '#d6a638', marginTop: 8, borderRadius: 2 },
});
