@@ .. @@
-import crypto from 'crypto';
+// Removed crypto import for Edge Runtime compatibility

 // Voice to Text using Web Speech API
 export class VoiceToText {
 }
@@ .. @@
 
 // AI Priority Analysis
 export async function analyzeTaskPriority(taskName, description, dueDate) {
   try {
     const response = await fetch('https://api.openai.com/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: 'gpt-3.5-turbo',
         messages: [{
           role: 'user',
           content: `Analyze this task and suggest priority (High/Medium/Low):
           Task: ${taskName}
           Description: ${description}
           Due Date: ${dueDate}
           
           Consider urgency, importance, and deadline. Respond with only: High, Medium, or Low`
         }],
         max_tokens: 10,
         temperature: 0.3,
       }),
     });

     const data = await response.json();
     return data.choices[0]?.message?.content?.trim() || 'Medium';
   } catch (error) {
     console.error('Priority analysis error:', error);
     return 'Medium';
   }
 }