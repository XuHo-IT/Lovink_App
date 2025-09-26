import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ActivityCardProps {
  id: number;
  title: string;
  iconType: string;
  onPress: () => void;
}

export function ActivityCard({ id, title, iconType, onPress }: ActivityCardProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadActivityImage = async () => {
      try {
        const imageUri = await AsyncStorage.getItem(`activity_image_${id}`);
        if (imageUri) {
          setCapturedImage(imageUri);
        }
      } catch (error) {
        console.error('Error loading activity image:', error);
      }
    };

    loadActivityImage();
  }, [id]);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <View style={styles.iconFrame}>
              {capturedImage ? (
                <Image 
                  source={{ uri: capturedImage }}
                  style={styles.activityImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.heartContainer}>
                  <Ionicons name="heart" size={16} color="#6A5AE0" />
                  <Ionicons name="heart-outline" size={12} color="#6A5AE0" style={styles.heartOutline1} />
                  <Ionicons name="heart-outline" size={10} color="#6A5AE0" style={styles.heartOutline2} />
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.activityTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EFEEFC',
    marginHorizontal: 9,
    marginVertical: 0,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingRight: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  iconBackground: {
    width: 69.47,
    height: 64,
    backgroundColor: '#C4D0FB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconFrame: {
    width: 48,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 28,
    height: 28,
  },
  heartOutline1: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  heartOutline2: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
    height: 48,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3D3D3D',
    fontFamily: 'Inter',
    lineHeight: 19.36,
  },
});