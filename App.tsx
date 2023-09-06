import { Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { useEffect, useRef, useState } from 'react';

const TensorCamera = cameraWithTensors(Camera);

export default function App() {
  const cameraRef = useRef(null);
  const [handDetectionResults, setHandDetectionResults] = useState([]);
  useEffect(() => {
    tf.ready().then(() => {
      console.log('TensorFlow carregado com sucesso.');
      loadHandPoseModel();
    });
  }, []);

  const loadHandPoseModel = async () => {
    try {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig:any = {

        runtime: 'tfjs',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: 'full',
      };
      const detector = await handPoseDetection.createDetector(model, detectorConfig);
      console.log('Modelo de detecção de pose de mão carregado com sucesso.',model);
      
        startHandDetection(detector);
      
     
    } catch (error) {
      console.error('Erro ao carregar o modelo de detecção de pose de mão:', error);
    }
  };

  const startHandDetection = async (detector:any) => {
    if (cameraRef.current) {
      const videoElement = cameraRef.current;
    

      try {
        const tensorStream = tf.browser.fromPixelsAsync(videoElement);
        const imageData = await tf.browser.toPixels(tensorStream as any)
        const hands = await detector.estimateHands(imageData);
        setHandDetectionResults(hands); 
      console.log(tensorStream,"aqui")

      
        requestAnimationFrame(() => startHandDetection(detector));
      } catch (error) {
      console.log(error)
      console.error('Erro ao estimar mãos:', error);
      }
    }
  };

  // Função para renderizar os pontos das mãos na tela
  const renderHandPoints = () => {
    return handDetectionResults.map((hand:any, index:any) => (
      <View key={index}>
        {hand.keypoints.map((keypoint:any, keypointIndex:any) => (
          <View
            key={keypointIndex}
            style={{
              position: 'absolute',
              backgroundColor: 'red',
              width: 10,
              height: 10,
              borderRadius: 5,
              left: keypoint.x,
              top: keypoint.y,
            }}
          />
        ))}
      </View>
    ));
  };

  return (
    <View style={{ flex: 1 }}>
      <TensorCamera 
        style={{ flex: 1 }}
        type={Camera.Constants.Type.front}
        ref={(ref:any) => {
          cameraRef.current = ref;
        }}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24 }}>Detecção de Pose de Mão</Text>
        {/* Exiba os resultados da detecção de pose de mão aqui */}
        {renderHandPoints()}
      </View>
    </View>
  );
}
