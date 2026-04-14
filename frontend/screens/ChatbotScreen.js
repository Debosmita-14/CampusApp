import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getApiUrl } from '../api';

function MessageBubble({ item, theme }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(item.sender === 'user' ? 20 : -20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = item.sender === 'user';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        {!isUser && (
          <View style={[styles.avatarWrap, { backgroundColor: theme.accentLight }]}>
            <Ionicons name="sparkles" size={14} color={theme.accent} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser
            ? { backgroundColor: theme.accent, borderBottomRightRadius: 4 }
            : { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1, borderBottomLeftRadius: 4 },
        ]}>
          <Text style={[styles.messageText, { color: isUser ? '#fff' : theme.text }]}>{item.text}</Text>
          {item.source && (
            <View style={styles.sourceRow}>
              <Ionicons name="hardware-chip" size={10} color={isUser ? 'rgba(255,255,255,0.6)' : theme.textMuted} />
              <Text style={[styles.sourceText, { color: isUser ? 'rgba(255,255,255,0.6)' : theme.textMuted }]}>{item.source}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatbotScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your CampusOS AI assistant. I can help you with:\n\n🏠 Room bookings & availability\n🔍 Lost & found items\n📅 Campus events\n📊 Crowd predictions\n🛡️ Safety alerts\n\nWhat would you like to know?", sender: 'bot', source: 'CampusAI v2.1' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const quickPrompts = [
    { icon: 'business', label: 'Free rooms?', prompt: 'Which rooms are available right now?' },
    { icon: 'people', label: 'Crowded?', prompt: 'Which areas are most crowded right now?' },
    { icon: 'calendar', label: 'Events', prompt: 'What events are happening today?' },
    { icon: 'alert-circle', label: 'Alerts', prompt: 'Are there any active campus alerts?' },
  ];

  const sendMessage = (text) => {
    const msgText = text || inputText;
    if (msgText.trim() === '') return;

    const userMsg = { id: Date.now().toString(), text: msgText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    fetch(getApiUrl('/chatbot/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msgText }),
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'bot',
          text: data.response,
          sender: 'bot',
          source: data.source || 'CampusAI',
        }]);
        setIsTyping(false);
      })
      .catch(err => {
        console.error('Chatbot error:', err);
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'bot',
          text: 'I\'m having trouble connecting. Please try again.',
          sender: 'bot',
        }]);
        setIsTyping(false);
      });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble item={item} theme={theme} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={[styles.typingWrap, { borderTopColor: theme.border }]}>
          <View style={[styles.typingDots]}>
            <ActivityIndicator size="small" color={theme.accent} />
            <Text style={[styles.typingText, { color: theme.textMuted }]}>CampusAI is thinking...</Text>
          </View>
        </View>
      )}

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPromptsWrap}>
          <ScrollableQuickPrompts prompts={quickPrompts} onPress={(prompt) => sendMessage(prompt)} theme={theme} />
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.bgSecondary, borderTopColor: theme.border }]}>
        <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask CampusOS anything..."
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            multiline={false}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.accent : theme.bgTertiary }]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <Ionicons name="arrow-up" size={20} color={inputText.trim() ? '#fff' : theme.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ScrollableQuickPrompts({ prompts, onPress, theme }) {
  return (
    <View style={styles.quickGrid}>
      {prompts.map((p, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.quickBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onPress(p.prompt)}
        >
          <Ionicons name={p.icon} size={16} color={theme.accent} />
          <Text style={[styles.quickLabel, { color: theme.textSecondary }]}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 10 },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  avatarWrap: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageBubble: { maxWidth: '78%', padding: 14, borderRadius: 18 },
  messageText: { fontSize: 15, lineHeight: 22 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  sourceText: { fontSize: 10, fontWeight: '500' },

  typingWrap: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 0.5 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontSize: 13, fontWeight: '500' },

  quickPromptsWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, gap: 6 },
  quickLabel: { fontSize: 13, fontWeight: '600' },

  inputContainer: { flexDirection: 'row', padding: 12, alignItems: 'center', borderTopWidth: 0.5 },
  inputWrap: { flex: 1, borderRadius: 22, borderWidth: 1, marginRight: 8 },
  input: { paddingHorizontal: 18, paddingVertical: 12, fontSize: 15 },
  sendButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
});
