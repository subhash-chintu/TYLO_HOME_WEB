import React, { useState } from 'react';
import {
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
          <Text style={styles.eyebrow}>HOME & KITCHEN</Text>
          <Text style={styles.brand}>Form & Foundry</Text>
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
  header: { paddingTop: 38, paddingBottom: 26, borderBottomWidth: 1, borderBottomColor: '#252525' },
  eyebrow: { color: '#9b9b9b', fontSize: 10, letterSpacing: 2, marginBottom: 12 },
  brand: { color: '#f5f5f5', fontSize: 29, fontWeight: '600', letterSpacing: -0.7 },
  subtitle: { color: '#a0a0a0', fontSize: 14, marginTop: 9 },
  content: { flex: 1, justifyContent: 'center' },
  emptyState: { paddingVertical: 30 },
  emptyTitle: { color: '#f5f5f5', fontSize: 21, fontWeight: '500', marginBottom: 9 },
  sectionTitle: { color: '#f5f5f5', fontSize: 23, fontWeight: '600', marginBottom: 9 },
  emptyCopy: { color: '#989898', fontSize: 14, lineHeight: 21 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#252525', paddingTop: 13, paddingBottom: 10 },
  tab: { flex: 1, alignItems: 'center', minHeight: 34 },
  tabText: { color: '#858585', fontSize: 12 },
  activeTabText: { color: '#f5f5f5' },
  activeMark: { width: 16, height: 2, backgroundColor: '#f5f5f5', marginTop: 8, borderRadius: 2 },
});
