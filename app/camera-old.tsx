import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activityId, activityTitle } = params;
  
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [zoom, setZoom] = useState(0); // 0 = 1x, 0.5 = 2x, 1 = max zoom
  const [zoomLevel, setZoomLevel] = useState(1); // Display zoom level (1x, 2x, etc.)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
        setIsConfirming(true);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const confirmPhoto = async () => {
    if (capturedImage && activityId) {
      try {
        // Store the image URI in AsyncStorage associated with the activity
        const key = `activity_image_${activityId}`;
        await AsyncStorage.setItem(key, capturedImage);
        
        // Also store in a general list of completed activities
        const completedActivitiesKey = 'completed_activities';
        const existingCompleted = await AsyncStorage.getItem(completedActivitiesKey);
        const completedList = existingCompleted ? JSON.parse(existingCompleted) : [];
        
        if (!completedList.includes(activityId)) {
          completedList.push(activityId);
          await AsyncStorage.setItem(completedActivitiesKey, JSON.stringify(completedList));
        }
        
        Alert.alert('Success!', 'Photo saved successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', 'Failed to save photo');
      }
    } else {
      router.back();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsConfirming(false);
  };

  const toggleCameraType = () => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === 'off' ? 'on' : 
      current === 'on' ? 'auto' : 'off'
    );
  };

  const handleZoomToggle = () => {
    // Cycle through zoom levels: 1x -> 2x -> 5x -> 1x
    if (zoomLevel === 1) {
      setZoom(0.3);
      setZoomLevel(2);
    } else if (zoomLevel === 2) {
      setZoom(0.6);
      setZoomLevel(5);
    } else {
      setZoom(0);
      setZoomLevel(1);
    }
  };

  // Pinch to zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      setShowZoomIndicator(true);
    })
    .onUpdate((event) => {
      // Calculate zoom based on pinch scale, with some smoothing
      const scaleChange = (event.scale - 1) * 0.5; // Reduce sensitivity
      const newZoom = Math.min(Math.max(0, zoom + scaleChange), 1);
      setZoom(newZoom);
      
      // Update display zoom level based on zoom value
      if (newZoom <= 0.15) {
        setZoomLevel(Math.round((1 + newZoom * 2) * 10) / 10);
      } else if (newZoom <= 0.5) {
        setZoomLevel(Math.round((1 + newZoom * 4) * 10) / 10);
      } else {
        setZoomLevel(Math.round((1 + newZoom * 8) * 10) / 10);
      }
    })
    .onEnd(() => {
      // Hide zoom indicator after a delay
      setTimeout(() => setShowZoomIndicator(false), 1000);
    });;

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Camera</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Activity Title */}
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>Suggest activities</Text>
        <View style={styles.activityBadge}>
          <Text style={styles.activityBadgeText}>{activityTitle || 'Activity'}</Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {!isConfirming ? (
          <GestureDetector gesture={pinchGesture}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={type}
              flash={flashMode}
              zoom={zoom}
            >
              {/* Camera Controls Overlay */}
              <View style={styles.cameraOverlay}>
                {/* Top Controls */}
                <View style={styles.topControls}>
                  <TouchableOpacity 
                    style={styles.flashButton}
                    onPress={toggleFlash}
                  >
                    <View style={styles.flashButtonInner}>
                      <Ionicons 
                        name={flashMode === 'on' ? "flash" : flashMode === 'auto' ? "flash" : "flash-off"} 
                        size={16} 
                        color="#FFFFFF" 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.zoomButton}
                    onPress={handleZoomToggle}
                  >
                    <Text style={styles.zoomText}>{zoomLevel}x</Text>
                  </TouchableOpacity>
                </View>

                {/* Zoom Indicator */}
                {showZoomIndicator && (
                  <View style={styles.zoomIndicator}>
                    <Text style={styles.zoomIndicatorText}>{zoomLevel}x</Text>
                  </View>
                )}

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <TouchableOpacity style={styles.galleryButton}>
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.shutterButton}
                  onPress={takePicture}
                >
                  <View style={styles.shutterButtonInner} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCameraType}
                >
                  <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
          </GestureDetector>
        ) : (
          /* Photo Preview */
          <View style={styles.previewContainer}>
            <View style={styles.imagePreview}>
              {capturedImage ? (
                <Image 
                  source={{ uri: capturedImage }} 
                  style={styles.capturedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.previewText}>Photo Preview</Text>
                </View>
              )}
            </View>
            
            {/* Confirmation Controls */}
            <View style={styles.confirmControls}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={retakePhoto}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmPhoto}
              >
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="flame" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="add" size={24} color="#FFF3F3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFAF6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 28,
  },
  activityHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  activityBadge: {
    backgroundColor: 'rgba(247, 152, 188, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activityBadgeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 10,
    borderRadius: 0,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  flashButton: {
    width: 35,
    height: 35,
  },
  flashButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(5, 4, 2, 0.7)',
  },
  zoomButton: {
    backgroundColor: '#47494C',
    borderRadius: 17,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  zoomIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicatorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  galleryButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EE4C89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 55.33,
    height: 55.33,
    borderRadius: 27.67,
    backgroundColor: '#F798BC',
  },
  flipButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  imagePreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  confirmControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  retakeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EE4C89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavigation: {
    backgroundColor: '#6DA7D5',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 15,
  },
  navButton: {
    padding: 8,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 8,
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
  },
});