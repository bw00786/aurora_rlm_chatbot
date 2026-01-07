import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

export function useSpeech(onResult: (text: string) => void) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const start = () => {
    if (!browserSupportsSpeechRecognition) return;
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  const stop = () => {
    SpeechRecognition.stopListening();
    if (transcript) {
      onResult(transcript);
      resetTranscript();
    }
  };

  return {
    listening,
    start,
    stop,
    supported: browserSupportsSpeechRecognition
  };
}
