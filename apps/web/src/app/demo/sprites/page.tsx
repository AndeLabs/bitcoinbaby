"use client";

/**
 * Genesis Baby Sprite Demo Page
 *
 * Muestra todos los sprites para revision de calidad.
 */

import { useState } from "react";
import {
  GenesisBabySprite,
  generateRandomTraits,
  HumanSprite,
  RobotSprite,
  MysticSprite,
  AlienSprite,
  ShamanSprite,
  ElementalSprite,
  DragonSprite,
  type GenesisBabyTraits,
  type GenesisBaseType,
  type GenesisBloodline,
  type GenesisHeritage,
  type GenesisRarity,
  type GenesisBabyState,
} from "@bitcoinbaby/ui";

type BaseType = GenesisBaseType;
type Bloodline = GenesisBloodline;
type Heritage = GenesisHeritage;
type Rarity = GenesisRarity;
type BabyState = GenesisBabyState;

const BASE_TYPES: BaseType[] = [
  "human",
  "robot",
  "mystic",
  "alien",
  "shaman",
  "elemental",
  "dragon",
];
const BLOODLINES: Bloodline[] = ["royal", "warrior", "rogue", "mystic"];
const HERITAGES: Heritage[] = [
  "americas",
  "africa",
  "asia",
  "europa",
  "oceania",
];
const RARITIES: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
];
const STATES: BabyState[] = [
  "idle",
  "happy",
  "sleeping",
  "hungry",
  "mining",
  "learning",
  "evolving",
  "thriving",
  "struggling",
];

export default function SpriteDemoPage() {
  const [selectedState, setSelectedState] = useState<BabyState>("idle");
  const [showFrame, setShowFrame] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [randomTraits, setRandomTraits] = useState<GenesisBabyTraits[]>(() =>
    Array.from({ length: 6 }, generateRandomTraits),
  );

  const regenerateRandom = () => {
    setRandomTraits(Array.from({ length: 6 }, generateRandomTraits));
  };

  return (
    <div className="min-h-screen bg-[#0f0f1b] text-white p-8">
      <h1 className="font-pixel text-2xl text-center mb-8 text-[#f7931a]">
        Genesis Baby Sprite Demo
      </h1>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-8 p-4 bg-gray-900 rounded-lg">
        <h2 className="font-pixel text-sm mb-4">Controls</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="text-xs">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as BabyState)}
              className="bg-gray-800 px-2 py-1 rounded text-xs"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFrame}
              onChange={(e) => setShowFrame(e.target.checked)}
            />
            <span className="text-xs">Frame</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBadge}
              onChange={(e) => setShowBadge(e.target.checked)}
            />
            <span className="text-xs">Badge</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            <span className="text-xs">Animated</span>
          </label>
          <button
            onClick={regenerateRandom}
            className="px-3 py-1 bg-[#f7931a] text-black text-xs rounded font-pixel hover:bg-orange-400"
          >
            Regenerate Random
          </button>
        </div>
      </div>

      {/* Base Types Section */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">Base Types</h2>
        <div className="grid grid-cols-7 gap-4">
          {BASE_TYPES.map((type) => (
            <div
              key={type}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400 capitalize mb-2">
                {type}
              </div>
              {type === "human" && (
                <HumanSprite size={80} state={selectedState} dna="a1b2c3d4" />
              )}
              {type === "robot" && (
                <RobotSprite size={80} state={selectedState} dna="5" />
              )}
              {type === "mystic" && (
                <MysticSprite size={80} state={selectedState} dna="a" />
              )}
              {type === "alien" && (
                <AlienSprite size={80} state={selectedState} dna="f" />
              )}
              {type === "shaman" && (
                <ShamanSprite size={80} state={selectedState} dna="0" />
              )}
              {type === "elemental" && (
                <ElementalSprite size={80} state={selectedState} dna="0" />
              )}
              {type === "dragon" && (
                <DragonSprite size={80} state={selectedState} dna="0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Elemental Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Elemental Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {["Fire", "Water", "Earth", "Air", "Lightning"][i]}
              </div>
              <ElementalSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Dragon Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Dragon Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {
                  [
                    "Fire Dragon",
                    "Ice Dragon",
                    "Earth Dragon",
                    "Storm Dragon",
                    "Shadow Dragon",
                  ][i]
                }
              </div>
              <DragonSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Robot Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Robot Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {["Classic", "Drone", "Tank", "Cyber", "Nano"][i]}
              </div>
              <RobotSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Mystic Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Mystic Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {["Mage", "Shaman", "Druid", "Oracle", "Elementalist"][i]}
              </div>
              <MysticSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Alien Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Alien Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {["Grey", "Reptilian", "Insectoid", "Cephalopod", "Energy"][i]}
              </div>
              <AlienSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Shaman Variants */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Shaman Variants
        </h2>
        <div className="grid grid-cols-5 gap-6">
          {["0", "3", "6", "9", "c"].map((dna, i) => (
            <div
              key={dna}
              className="flex flex-col items-center gap-2 p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="text-xs text-gray-400">
                {["Shaman", "Druid", "Witch", "Healer", "Elder"][i]}
              </div>
              <ShamanSprite size={80} state={selectedState} dna={dna} />
            </div>
          ))}
        </div>
      </section>

      {/* Combined: Base + Bloodline + Heritage + Rarity */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Combined Traits (Full NFTs)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {randomTraits.map((traits, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-lg"
            >
              <GenesisBabySprite
                traits={traits}
                size={80}
                state={selectedState}
                showFrame={showFrame}
                showBadge={showBadge}
                animated={animated}
              />
              <div className="text-[10px] text-gray-400 text-center">
                <div className="capitalize">{traits.baseType}</div>
                <div className="text-gray-500">
                  {traits.bloodline} / {traits.heritage}
                </div>
                <div className="text-gray-500">{traits.rarity}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rarity Showcase */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Rarity Effects
        </h2>
        <div className="grid grid-cols-6 gap-4">
          {RARITIES.map((rarity) => (
            <div
              key={rarity}
              className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-lg"
            >
              <GenesisBabySprite
                traits={{
                  baseType: "human",
                  bloodline: "royal",
                  heritage: "americas",
                  rarity,
                  dna: "1234567890abcdef",
                }}
                size={64}
                state={selectedState}
                showFrame={showFrame}
                showBadge={showBadge}
                animated={animated}
              />
              <div className="text-xs text-gray-400 capitalize">{rarity}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bloodline Showcase */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Bloodline Overlays
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {BLOODLINES.map((bloodline) => (
            <div
              key={bloodline}
              className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-lg"
            >
              <GenesisBabySprite
                traits={{
                  baseType: "human",
                  bloodline,
                  heritage: "americas",
                  rarity: "rare",
                  dna: "abcdef1234567890",
                }}
                size={80}
                state={selectedState}
                showFrame={false}
                showBadge={false}
                animated={animated}
              />
              <div className="text-xs text-gray-400 capitalize">
                {bloodline}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Heritage Showcase */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">
          Heritage Overlays
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {HERITAGES.map((heritage) => (
            <div
              key={heritage}
              className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-lg"
            >
              <GenesisBabySprite
                traits={{
                  baseType: "mystic",
                  bloodline: "royal",
                  heritage,
                  rarity: "epic",
                  dna: "fedcba0987654321",
                }}
                size={72}
                state={selectedState}
                showFrame={false}
                showBadge={false}
                animated={animated}
              />
              <div className="text-xs text-gray-400 capitalize">{heritage}</div>
            </div>
          ))}
        </div>
      </section>

      {/* States */}
      <section className="max-w-6xl mx-auto mb-12">
        <h2 className="font-pixel text-lg mb-4 text-[#4fc3f7]">All States</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {STATES.map((state) => (
            <div
              key={state}
              className="flex flex-col items-center gap-2 p-2 bg-gray-900/50 rounded-lg"
            >
              <HumanSprite size={56} state={state} dna="abc123" />
              <div className="text-[10px] text-gray-400">{state}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
