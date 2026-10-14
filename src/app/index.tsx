import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLANS = ['Free', 'Pro', 'Enterprise'];
const INTERESTS = ['Technology', 'Sports', 'Music', 'Travel'];
const GENDERS = ['Female', 'Male', 'Other'];
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
const COUNTRIES = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Nigeria'];

type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

function Slider({ value, min = 0, max = 100, step = 1, onChange }: SliderProps) {
  const trackRef = useRef<View | null>(null);
  const originRef = useRef(0);
  const widthRef = useRef(0);
  const configRef = useRef({ min, max, step });
  const onChangeRef = useRef(onChange);
  configRef.current = { min, max, step };
  onChangeRef.current = onChange;

  const update = useCallback((x: number) => {
    const w = widthRef.current;
    if (w <= 0) return;
    const { min: lo, max: hi, step: st } = configRef.current;
    const ratio = Math.max(0, Math.min(1, x / w));
    let next = lo + ratio * (hi - lo);
    next = Math.round(next / st) * st;
    onChangeRef.current(Math.max(lo, Math.min(hi, next)));
  }, []);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        trackRef.current?.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
          originRef.current = pageX;
          update(e.nativeEvent.pageX - pageX);
        });
      },
      onPanResponderMove: (e) => update(e.nativeEvent.pageX - originRef.current),
    }),
  ).current;

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <View
      ref={trackRef}
      style={styles.sliderTrack}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
      {...responder.panHandlers}>
      <View style={[styles.sliderFill, { width: `${percent}%` }]} />
      <View style={[styles.sliderThumb, { left: `${percent}%` }]} />
    </View>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)}>
          <Text style={styles.star}>{star <= value ? '★' : '☆'}</Text>
        </Pressable>
      ))}
      <Text style={styles.optionLabel}> ({value}/5)</Text>
    </View>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepperButton} onPress={() => onChange(Math.max(0, value - 1))}>
        <Text style={styles.stepperButtonText}>–</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable style={styles.stepperButton} onPress={() => onChange(value + 1)}>
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

export default function FormScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [age, setAge] = useState('');
  const [date, setDate] = useState('');
  const [bio, setBio] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [plan, setPlan] = useState('Free');
  const [gender, setGender] = useState('Female');
  const [interests, setInterests] = useState<string[]>([]);
  const [color, setColor] = useState(COLORS[3]);
  const [volume, setVolume] = useState(40);
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [document, setDocument] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera permission is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled) {
      setDocument(result.assets[0].name);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', {
      fullName,
      username,
      email,
      password,
      phone,
      website,
      age,
      date,
      bio,
      newsletter,
      terms,
      plan,
      gender,
      interests,
      color,
      volume,
      rating,
      quantity,
      country,
      image,
      document,
    });
  };

  const handleReset = () => {
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPhone('');
    setWebsite('');
    setAge('');
    setDate('');
    setBio('');
    setNewsletter(false);
    setTerms(false);
    setPlan('Free');
    setGender('Female');
    setInterests([]);
    setColor(COLORS[3]);
    setVolume(40);
    setRating(0);
    setQuantity(1);
    setCountry('');
    setImage(null);
    setDocument(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Registration form</Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jane Doe"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="janedoe"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="jane@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 700 000 000"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="25"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Country</Text>
          <Pressable style={styles.input} onPress={() => setCountryOpen((open) => !open)}>
            <Text style={country ? styles.selectValue : styles.selectPlaceholder}>
              {country || 'Select a country'}
            </Text>
          </Pressable>
          {countryOpen &&
            COUNTRIES.map((option) => (
              <Pressable
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setCountry(option);
                  setCountryOpen(false);
                }}>
                <Text style={styles.optionLabel}>{option}</Text>
              </Pressable>
            ))}

          <Text style={styles.label}>Gender</Text>
          <View style={styles.segment}>
            {GENDERS.map((option) => (
              <Pressable
                key={option}
                style={[styles.segmentButton, gender === option && styles.segmentActive]}
                onPress={() => setGender(option)}>
                <Text style={gender === option ? styles.segmentTextActive : styles.segmentText}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Plan</Text>
          {PLANS.map((option) => (
            <Pressable key={option} style={styles.option} onPress={() => setPlan(option)}>
              <View style={[styles.radio, plan === option && styles.radioSelected]} />
              <Text style={styles.optionLabel}>{option}</Text>
            </Pressable>
          ))}

          <Text style={styles.label}>Interests</Text>
          {INTERESTS.map((interest) => {
            const checked = interests.includes(interest);
            return (
              <Pressable
                key={interest}
                style={styles.option}
                onPress={() => toggleInterest(interest)}>
                <View style={[styles.checkbox, checked && styles.checkboxSelected]} />
                <Text style={styles.optionLabel}>{interest}</Text>
              </Pressable>
            );
          })}

          <Text style={styles.label}>Favorite color</Text>
          <View style={styles.row}>
            {COLORS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setColor(option)}
                style={[
                  styles.swatch,
                  { backgroundColor: option },
                  color === option && styles.swatchSelected,
                ]}
              />
            ))}
            <Text style={styles.optionLabel}> {color}</Text>
          </View>

          <Text style={styles.label}>Volume: {volume}</Text>
          <Slider value={volume} onChange={setVolume} />

          <Text style={styles.label}>Rating</Text>
          <StarRating value={rating} onChange={setRating} />

          <Text style={styles.label}>Quantity</Text>
          <Stepper value={quantity} onChange={setQuantity} />

          <View style={styles.row}>
            <Text style={styles.label}>Subscribe to newsletter</Text>
            <Switch value={newsletter} onValueChange={setNewsletter} />
          </View>

          <Pressable style={styles.option} onPress={() => setTerms((value) => !value)}>
            <View style={[styles.checkbox, terms && styles.checkboxSelected]} />
            <Text style={styles.optionLabel}>I accept the terms and conditions</Text>
          </Pressable>

          <Text style={styles.label}>Profile photo</Text>
          <View style={styles.row}>
            <Pressable style={styles.smallButton} onPress={pickImage}>
              <Text style={styles.smallButtonText}>Upload image</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={openCamera}>
              <Text style={styles.smallButtonText}>Open camera</Text>
            </Pressable>
          </View>
          {image && <Image source={{ uri: image }} style={styles.preview} />}

          <Text style={styles.label}>Document</Text>
          <Pressable style={styles.smallButton} onPress={pickDocument}>
            <Text style={styles.smallButtonText}>Upload document</Text>
          </Pressable>
          {document && <Text style={styles.optionLabel}>{document}</Text>}

          <Pressable
            style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
            onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  selectPlaceholder: {
    color: '#999999',
    fontSize: 16,
  },
  selectValue: {
    fontSize: 16,
  },
  dropdownItem: {
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: {
    height: 96,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#3c87f7',
  },
  segmentText: {
    fontSize: 14,
  },
  segmentTextActive: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cccccc',
  },
  radioSelected: {
    borderColor: '#3c87f7',
    borderWidth: 7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cccccc',
  },
  checkboxSelected: {
    borderColor: '#3c87f7',
    backgroundColor: '#3c87f7',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dddddd',
    marginVertical: 16,
    justifyContent: 'center',
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3c87f7',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3c87f7',
    marginLeft: -10,
  },
  star: {
    fontSize: 32,
    color: '#f59e0b',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  stepperValue: {
    fontSize: 18,
    minWidth: 24,
    textAlign: 'center',
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#3c87f7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  smallButtonText: {
    color: '#3c87f7',
    fontWeight: '600',
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  submit: {
    marginTop: 24,
    backgroundColor: '#3c87f7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  reset: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
