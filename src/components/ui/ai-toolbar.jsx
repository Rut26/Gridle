@@ .. @@
 "use client";

 import React, { useState } from 'react';
-import { HiMicrophone, HiSparkles, HiTranslate, HiPencil } from 'react-icons/hi';
+import { HiMicrophone, HiSparkles, HiTranslate, HiPencil, HiStop } from 'react-icons/hi';
 import { useToast } from '@/hooks/use-toast';

 const AIToolbar = ({ text, onTextChange, placeholder = "Enter text..." }) => {
@@ .. @@
   const [isListening, setIsListening] = useState(false);
   const [recognition, setRecognition] = useState(null);

+  // Initialize speech recognition
+  React.useEffect(() => {
+    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
+      const speechRecognition = new window.webkitSpeechRecognition();
+      speechRecognition.continuous = true;
+      speechRecognition.interimResults = true;
+      speechRecognition.lang = 'en-US';
+      
+      speechRecognition.onresult = (event) => {
+        let finalTranscript = '';
+        let interimTranscript = '';
+        
+        for (let i = event.resultIndex; i < event.results.length; i++) {
+          const transcript = event.results[i][0].transcript;
+          if (event.results[i].isFinal) {
+            finalTranscript += transcript;
+          } else {
+            interimTranscript += transcript;
+          }
+        }
+        
+        if (finalTranscript) {
+          onTextChange(text + finalTranscript);
+        }
+      };
+      
+      speechRecognition.onerror = (event) => {
+        console.error('Speech recognition error:', event.error);
+        setIsListening(false);
+        toast({
+          title: "Voice Recognition Error",
+          description: "Please try again or check microphone permissions.",
+          variant: "destructive",
+        });
+      };
+      
+      speechRecognition.onend = () => {
+        setIsListening(false);
+      };
+      
+      setRecognition(speechRecognition);
+    }
+  }, []);

   const startVoiceRecognition = () => {
-    // Voice recognition implementation would go here
-    toast({
-      title: "Voice Recognition",
-      description: "Voice recognition started (demo mode)",
-    });
+    if (recognition) {
+      setIsListening(true);
+      recognition.start();
+      toast({
+        title: "Listening...",
+        description: "Speak now, I'm listening!",
+      });
+    } else {
+      toast({
+        title: "Not Supported",
+        description: "Voice recognition is not supported in this browser.",
+        variant: "destructive",
+      });
+    }
+  };
+
+  const stopVoiceRecognition = () => {
+    if (recognition && isListening) {
+      recognition.stop();
+      setIsListening(false);
+    }
   };

   const handleAIAction = async (action, options = {}) => {
@@ .. @@
         <button
           onClick={startVoiceRecognition}
-          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
+          onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
+          className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
+            isListening 
+              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
+              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
+          }`}
           disabled={loading}
         >
-          <HiMicrophone className="w-4 h-4" />
-          <span>Voice</span>
+          {isListening ? <HiStop className="w-4 h-4" /> : <HiMicrophone className="w-4 h-4" />}
+          <span>{isListening ? 'Stop' : 'Voice'}</span>
         </button>