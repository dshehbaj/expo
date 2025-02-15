import * as FaceDetector from 'expo-face-detector';
import * as ImagePicker from 'expo-image-picker';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import React from 'react';
import { Alert, Image, PixelRatio, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { scaledFace, scaledLandmarks } from '../components/Face';
import ListButton from '../components/ListButton';
import MonoText from '../components/MonoText';

interface State {
  selection?: ImagePicker.ImagePickerResult;
  faceDetection?: {
    detecting: boolean;
    faces: FaceDetector.FaceFeature[];
    image?: FaceDetector.Image;
    error?: any;
  };
}

const imageViewSize = 300;
// See: https://github.com/expo/expo/pull/10229#discussion_r490961694
// eslint-disable-next-line @typescript-eslint/ban-types
export default class FeceDetectorScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'FaceDetector',
  };

  readonly state: State = {};

  detectFaces = (picture: string) => {
    this.setState({
      faceDetection: {
        detecting: true,
        faces: [],
      },
    });
    FaceDetector.detectFacesAsync(picture, {
      mode: FaceDetector.FaceDetectorMode.accurate,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.none,
    })
      .then(result => {
        this.setState({
          faceDetection: {
            detecting: false,
            faces: result.faces,
            image: result.image,
          },
        });
      })
      .catch(error => {
        this.setState({
          faceDetection: {
            detecting: false,
            faces: [],
            error,
          },
        });
      });
  };

  showPicker = async (mediaTypes: ImagePicker.MediaTypeOptions, allowsEditing = false) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (granted || Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing,
      });
      if (result.cancelled) {
        this.setState({ selection: undefined });
      } else {
        this.setState({ selection: result });
        this.detectFaces(result.uri);
      }
    } else {
      Alert.alert('Permission required!', 'You must allow accessing images in order to proceed.');
    }
  };

  render() {
    return (
      <ScrollView style={{ padding: 10 }}>
        <ListButton
          onPress={() => {
            this.showPicker(ImagePicker.MediaTypeOptions.Images);
          }}
          title="Pick photo"
        />
        {this._maybeRenderSelection()}
        {this._maybeRenderFaceDetection()}
      </ScrollView>
    );
  }

  _maybeRenderSelection = () => {
    const { selection } = this.state;

    if (!selection || selection.cancelled) {
      return;
    }

    return (
      <View style={styles.sectionContainer}>
        {!selection || selection.type === 'video' ? null : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selection.uri }} resizeMode="contain" style={styles.image} />
            {this._maybeRenderDetectedFacesAndLandmarks()}
          </View>
        )}
        <MonoText>{JSON.stringify(selection, null, 2)}</MonoText>
      </View>
    );
  };

  _maybeRenderFaceDetection = () => {
    const { selection, faceDetection } = this.state;

    if (!selection || selection.cancelled || !faceDetection) {
      return;
    }

    if (faceDetection && faceDetection.detecting) {
      return (
        <View style={styles.sectionContainer}>
          <MonoText>Detecting faces…</MonoText>
        </View>
      );
    }

    if (faceDetection && faceDetection.error) {
      return (
        <View style={styles.sectionContainer}>
          <MonoText>Something went wrong: {JSON.stringify(faceDetection.error)}</MonoText>
        </View>
      );
    }

    if (faceDetection && !faceDetection.detecting) {
      return (
        <View style={styles.sectionContainer}>
          <MonoText>Detected faces: {JSON.stringify(faceDetection.faces)}</MonoText>
          {faceDetection.image && (
            <MonoText>In image: {JSON.stringify(faceDetection.image)}</MonoText>
          )}
        </View>
      );
    }

    return null;
  };

  _maybeRenderDetectedFacesAndLandmarks = () => {
    const { selection, faceDetection } = this.state;
    if (selection && faceDetection) {
      const { pixelsToDisplayScale } = calculateImageScale(selection as ImageInfo);
      return (
        <View
          style={{
            ...imageOverflowSizeAndPosition(selection as ImageInfo),
            position: 'absolute',
          }}>
          {this.state.faceDetection &&
            this.state.faceDetection.faces.map(scaledFace(pixelsToDisplayScale))}
          {this.state.faceDetection &&
            this.state.faceDetection.faces.map(scaledLandmarks(pixelsToDisplayScale))}
        </View>
      );
    }
    return null;
  };
}

const imageOverflowSizeAndPosition = (image: ImageInfo) => {
  const { scaledImageWidth, scaledImageHeight } = calculateImageScale(image);
  return {
    top: (imageViewSize - scaledImageHeight) / 2,
    left: (imageViewSize - scaledImageWidth) / 2,
    width: scaledImageWidth,
    height: scaledImageHeight,
  };
};

const calculateImageScale = (image: ImageInfo) => {
  let scale = 1;
  const screenMultiplier = PixelRatio.getPixelSizeForLayoutSize(1);
  const imageHeight = image.height / screenMultiplier;
  const imageWidth = image.width / screenMultiplier;
  if (imageWidth > imageHeight) {
    scale = imageViewSize / imageWidth;
  } else {
    scale = imageViewSize / imageHeight;
  }
  return {
    displayScale: scale,
    pixelsToDisplayScale: scale / screenMultiplier,
    scaledImageWidth: imageWidth * scale,
    scaledImageHeight: imageHeight * scale,
  };
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 10,
    width: imageViewSize,
    height: imageViewSize,
  },
  image: { flex: 1, width: imageViewSize, height: imageViewSize },
});
