import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  G,
  Line,
} from 'react-native-svg';
import { RADIUS, SPACING } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

export const HomeArtisticHero: React.FC = () => {
  const { isDark, accent } = useTheme();

  const primaryColor = accent.primary;
  const secondaryColor = accent.deep;
  const bgFill = isDark ? '#0B0F17' : '#F8FAFC';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: bgFill,
            borderColor: cardBorder,
          },
        ]}
      >
        <Svg
          viewBox="0 0 380 135"
          width="100%"
          height={135}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <RadialGradient
              id="heroBackGlow"
              cx="50%"
              cy="40%"
              rx="60%"
              ry="50%"
              fx="50%"
              fy="30%"
            >
              <Stop
                offset="0%"
                stopColor={primaryColor}
                stopOpacity={isDark ? 0.24 : 0.14}
              />
              <Stop
                offset="60%"
                stopColor={secondaryColor}
                stopOpacity={isDark ? 0.08 : 0.05}
              />
              <Stop offset="100%" stopColor={bgFill} stopOpacity={0} />
            </RadialGradient>

            <RadialGradient
              id="centralPrismGlow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
            >
              <Stop
                offset="0%"
                stopColor={primaryColor}
                stopOpacity={isDark ? 0.75 : 0.55}
              />
              <Stop
                offset="60%"
                stopColor={secondaryColor}
                stopOpacity={isDark ? 0.35 : 0.2}
              />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </RadialGradient>

            <LinearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop
                offset="0%"
                stopColor={primaryColor}
                stopOpacity={isDark ? 0.55 : 0.4}
              />
              <Stop
                offset="50%"
                stopColor={secondaryColor}
                stopOpacity={isDark ? 0.35 : 0.22}
              />
              <Stop
                offset="100%"
                stopColor={primaryColor}
                stopOpacity={isDark ? 0.1 : 0.05}
              />
            </LinearGradient>

            <LinearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor={secondaryColor}
                stopOpacity={isDark ? 0.5 : 0.35}
              />
              <Stop
                offset="70%"
                stopColor={primaryColor}
                stopOpacity={isDark ? 0.25 : 0.15}
              />
              <Stop offset="100%" stopColor={bgFill} stopOpacity={0} />
            </LinearGradient>

            <LinearGradient id="ribbonStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity={0.2} />
              <Stop offset="35%" stopColor={primaryColor} stopOpacity={0.85} />
              <Stop offset="70%" stopColor={secondaryColor} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={secondaryColor} stopOpacity={0.1} />
            </LinearGradient>

            <LinearGradient id="prismGradA" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity={0.95} />
              <Stop offset="100%" stopColor={secondaryColor} stopOpacity={0.8} />
            </LinearGradient>

            <LinearGradient id="prismGradB" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity={0.85} />
            </LinearGradient>
          </Defs>

          <Rect x="0" y="0" width="380" height="135" fill="url(#heroBackGlow)" />

          <G stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'} strokeWidth="1" strokeDasharray="3,4">
            <Line x1="40" y1="25" x2="120" y2="55" />
            <Line x1="120" y1="55" x2="190" y2="45" />
            <Line x1="190" y1="45" x2="260" y2="55" />
            <Line x1="260" y1="55" x2="340" y2="25" />
            <Line x1="70" y1="105" x2="150" y2="82" />
            <Line x1="150" y1="82" x2="230" y2="82" />
            <Line x1="230" y1="82" x2="310" y2="105" />
          </G>

          <Path
            d="M -10 110 C 60 65, 130 130, 190 80 C 250 30, 320 95, 390 55 L 390 140 L -10 140 Z"
            fill="url(#waveGrad1)"
          />

          <Path
            d="M -10 85 C 80 125, 150 45, 210 90 C 270 135, 330 70, 390 110 L 390 140 L -10 140 Z"
            fill="url(#waveGrad2)"
          />

          <Path
            d="M -5 100 C 70 60, 135 120, 190 75 C 245 30, 315 90, 385 50"
            fill="none"
            stroke="url(#ribbonStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <Path
            d="M 10 90 C 90 130, 155 55, 210 90 C 265 125, 325 65, 375 100"
            fill="none"
            stroke={secondaryColor}
            strokeOpacity={isDark ? 0.45 : 0.3}
            strokeWidth="1.5"
            strokeDasharray="4,6"
            strokeLinecap="round"
          />

          <Circle cx="55" cy="38" r="13" fill={primaryColor} fillOpacity={isDark ? 0.12 : 0.08} />
          <Circle cx="55" cy="38" r="3.5" fill={primaryColor} />
          <Circle cx="55" cy="38" r="1.5" fill="#FFFFFF" />

          <Circle cx="120" cy="55" r="4.5" fill={secondaryColor} fillOpacity={0.8} />
          <Circle cx="120" cy="55" r="2" fill="#FFFFFF" />

          <Circle cx="85" cy="98" r="3" fill={primaryColor} fillOpacity={0.6} />

          <Circle cx="325" cy="38" r="13" fill={secondaryColor} fillOpacity={isDark ? 0.12 : 0.08} />
          <Circle cx="325" cy="38" r="3.5" fill={secondaryColor} />
          <Circle cx="325" cy="38" r="1.5" fill="#FFFFFF" />

          <Circle cx="260" cy="55" r="4.5" fill={primaryColor} fillOpacity={0.8} />
          <Circle cx="260" cy="55" r="2" fill="#FFFFFF" />

          <Circle cx="295" cy="98" r="3" fill={secondaryColor} fillOpacity={0.6} />

          <G transform="translate(190, 50)">
            <Circle cx="0" cy="0" r="34" fill="url(#centralPrismGlow)" />
            <Circle
              cx="0"
              cy="0"
              r="20"
              fill="none"
              stroke={primaryColor}
              strokeOpacity={isDark ? 0.35 : 0.2}
              strokeWidth="1"
              strokeDasharray="2,3"
            />

            <Path
              d="M 0 -17 L 13 -4 L 0 2 Z"
              fill="url(#prismGradA)"
            />
            <Path
              d="M 0 -17 L -13 -4 L 0 2 Z"
              fill="url(#prismGradB)"
            />
            <Path
              d="M 0 2 L 13 -4 L 7 16 L 0 11 Z"
              fill={secondaryColor}
              fillOpacity={isDark ? 0.9 : 0.8}
            />
            <Path
              d="M 0 2 L -13 -4 L -7 16 L 0 11 Z"
              fill={primaryColor}
              fillOpacity={isDark ? 0.95 : 0.85}
            />

            <Circle cx="0" cy="-2" r="2.5" fill="#FFFFFF" />
          </G>

          <Path
            d="M 225 22 Q 225 27 230 27 Q 225 27 225 32 Q 225 27 220 27 Q 225 27 225 22 Z"
            fill={primaryColor}
          />
          <Path
            d="M 152 26 Q 152 30 156 30 Q 152 30 152 34 Q 152 30 148 30 Q 152 30 152 26 Z"
            fill={secondaryColor}
          />
          <Path
            d="M 350 70 Q 350 73 353 73 Q 350 73 350 76 Q 350 73 347 73 Q 350 73 350 70 Z"
            fill={primaryColor}
            fillOpacity={0.8}
          />
          <Path
            d="M 30 72 Q 30 75 33 75 Q 30 75 30 78 Q 30 75 27 75 Q 30 75 30 72 Z"
            fill={secondaryColor}
            fillOpacity={0.8}
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  cardContainer: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
});
