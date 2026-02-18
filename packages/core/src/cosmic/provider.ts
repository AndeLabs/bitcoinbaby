/**
 * Cosmic Provider using Astronomy Engine
 * Open source, no API key required, works offline
 * https://github.com/cosinekitty/astronomy
 */

import * as Astronomy from "astronomy-engine";
import type {
  CosmicEvent,
  ICosmicProvider,
  MoonData,
  MoonPhase,
  Season,
  SeasonData,
  SunData,
} from "./types";
import { MOON_EMOJI, SEASON_EMOJI } from "./constants";

// =============================================================================
// ASTRONOMY ENGINE PROVIDER
// =============================================================================

export type Hemisphere = "north" | "south";

export class AstronomyEngineProvider implements ICosmicProvider {
  private hemisphere: Hemisphere;

  constructor(hemisphere: Hemisphere = "north") {
    this.hemisphere = hemisphere;
  }

  /**
   * Set the hemisphere for season calculations
   */
  setHemisphere(hemisphere: Hemisphere): void {
    this.hemisphere = hemisphere;
  }

  /**
   * Get current hemisphere
   */
  getHemisphere(): Hemisphere {
    return this.hemisphere;
  }

  /**
   * Get current moon data
   */
  getMoonData(date: Date): MoonData {
    const phaseAngle = Astronomy.MoonPhase(date);
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date);

    // Find next full and new moons
    const nextFull = Astronomy.SearchMoonPhase(180, date, 30);
    const nextNew = Astronomy.SearchMoonPhase(0, date, 30);

    const phase = this.angleToPhase(phaseAngle);

    return {
      phase,
      angle: phaseAngle,
      illumination: illumination.phase_fraction * 100,
      emoji: MOON_EMOJI[phase],
      isVisible: this.isMoonVisible(date, phaseAngle),
      nextFullMoon:
        nextFull?.date || new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
      nextNewMoon:
        nextNew?.date || new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Get sun data for a specific location
   */
  getSunData(date: Date, lat: number, lon: number): SunData {
    const observer = new Astronomy.Observer(lat, lon, 0);

    // Search for sunrise and sunset
    const sunrise = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      observer,
      +1,
      date,
      1,
    );
    const sunset = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      observer,
      -1,
      date,
      1,
    );

    // Calculate solar noon (sun at highest point)
    const noon = Astronomy.SearchHourAngle(
      Astronomy.Body.Sun,
      observer,
      0,
      date,
      1,
    );

    // Determine if it's day or night
    const isDay = this.isDaytime(
      date,
      sunrise?.date || null,
      sunset?.date || null,
    );

    // Calculate day length
    let dayLength = 12; // Default
    if (sunrise?.date && sunset?.date) {
      dayLength =
        (sunset.date.getTime() - sunrise.date.getTime()) / (1000 * 60 * 60);
    }

    return {
      isDay,
      sunrise: sunrise?.date || null,
      sunset: sunset?.date || null,
      solarNoon: noon?.time.date || null,
      dayLength,
    };
  }

  /**
   * Get season data
   */
  getSeasonData(date: Date, hemisphere: "north" | "south"): SeasonData {
    const year = date.getFullYear();
    const seasons = Astronomy.Seasons(year);

    // Get season dates
    const springEquinox = seasons.mar_equinox.date;
    const summerSolstice = seasons.jun_solstice.date;
    const autumnEquinox = seasons.sep_equinox.date;
    const winterSolstice = seasons.dec_solstice.date;

    // Determine current season
    let current: Season;
    const now = date.getTime();

    if (hemisphere === "north") {
      if (now < springEquinox.getTime()) current = "winter";
      else if (now < summerSolstice.getTime()) current = "spring";
      else if (now < autumnEquinox.getTime()) current = "summer";
      else if (now < winterSolstice.getTime()) current = "autumn";
      else current = "winter";
    } else {
      // Southern hemisphere - seasons are reversed
      if (now < springEquinox.getTime()) current = "summer";
      else if (now < summerSolstice.getTime()) current = "autumn";
      else if (now < autumnEquinox.getTime()) current = "winter";
      else if (now < winterSolstice.getTime()) current = "spring";
      else current = "summer";
    }

    // Find next events
    const upcomingEvents = [
      {
        type: "equinox" as const,
        date: springEquinox,
        name: "Equinoccio de Primavera",
      },
      {
        type: "solstice" as const,
        date: summerSolstice,
        name: "Solsticio de Verano",
      },
      {
        type: "equinox" as const,
        date: autumnEquinox,
        name: "Equinoccio de Otono",
      },
      {
        type: "solstice" as const,
        date: winterSolstice,
        name: "Solsticio de Invierno",
      },
    ].filter((e) => e.date.getTime() > now);

    // If no events this year, get next year's first event
    let nextEvent = upcomingEvents[0];
    if (!nextEvent) {
      const nextYearSeasons = Astronomy.Seasons(year + 1);
      nextEvent = {
        type: "equinox",
        date: nextYearSeasons.mar_equinox.date,
        name: "Equinoccio de Primavera",
      };
    }

    // Calculate days until next solstice and equinox
    const nextSolstice =
      upcomingEvents.find((e) => e.type === "solstice") ||
      this.getNextSolstice(date, year + 1);
    const nextEquinox =
      upcomingEvents.find((e) => e.type === "equinox") ||
      this.getNextEquinox(date, year + 1);

    // Calculate season progression and next season
    const seasonOrder: Season[] = ["spring", "summer", "autumn", "winter"];
    const currentIndex = seasonOrder.indexOf(current);
    const nextSeasonName = seasonOrder[(currentIndex + 1) % 4];

    // Calculate days until next season change
    const daysUntilNext = Math.min(
      this.daysBetween(date, nextSolstice.date),
      this.daysBetween(date, nextEquinox.date),
    );

    // Estimate progress through current season (rough approximation)
    const seasonLength = 91; // Approximate days per season
    const progress = Math.max(
      0,
      Math.min(100, ((seasonLength - daysUntilNext) / seasonLength) * 100),
    );

    return {
      current,
      emoji: SEASON_EMOJI[current],
      hemisphere,
      progress,
      nextSeason: nextSeasonName,
      daysUntilNext,
      daysUntilNextSolstice: this.daysBetween(date, nextSolstice.date),
      daysUntilNextEquinox: this.daysBetween(date, nextEquinox.date),
      nextEvent,
    };
  }

  /**
   * Get next lunar eclipse
   */
  getNextEclipse(date: Date): CosmicEvent | null {
    try {
      const lunarEclipse = Astronomy.SearchLunarEclipse(date);

      if (lunarEclipse && lunarEclipse.kind !== "penumbral") {
        // Calculate duration (approximate)
        const durationHours = 3; // Typical lunar eclipse duration
        const startTime = new Date(
          lunarEclipse.peak.date.getTime() -
            (durationHours / 2) * 60 * 60 * 1000,
        );
        const endTime = new Date(
          lunarEclipse.peak.date.getTime() +
            (durationHours / 2) * 60 * 60 * 1000,
        );

        return {
          id: `lunar-eclipse-${lunarEclipse.peak.date.toISOString()}`,
          type: "eclipse_lunar",
          name:
            lunarEclipse.kind === "total"
              ? "Eclipse Lunar Total"
              : "Eclipse Lunar Parcial",
          emoji: lunarEclipse.kind === "total" ? "🌑" : "🌘",
          description:
            lunarEclipse.kind === "total"
              ? "La Luna se tine de rojo sangre"
              : "La sombra de la Tierra cubre parte de la Luna",
          startTime,
          endTime,
          peakTime: lunarEclipse.peak.date,
          intensity: lunarEclipse.kind === "total" ? 1.0 : 0.6,
          multipliers: {
            human: 0.15,
            animal: 0.15,
            robot: -0.2,
            mystic: 0.3,
            alien: 0.2,
          },
          isCritical: true,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get current active events
   */
  getCurrentEvents(date: Date): CosmicEvent[] {
    const events: CosmicEvent[] = [];

    // Check for eclipse
    const eclipse = this.getNextEclipse(
      new Date(date.getTime() - 24 * 60 * 60 * 1000),
    );
    if (eclipse && date >= eclipse.startTime && date <= eclipse.endTime) {
      events.push(eclipse);
    }

    // Check for solstice/equinox (within 24 hours)
    const seasonData = this.getSeasonData(date, this.hemisphere);
    if (seasonData.daysUntilNextSolstice === 0) {
      events.push(
        this.createSolsticeEvent(seasonData.nextEvent.date, seasonData),
      );
    }
    if (seasonData.daysUntilNextEquinox === 0) {
      events.push(this.createEquinoxEvent(seasonData.nextEvent.date));
    }

    return events;
  }

  /**
   * Get upcoming events for the next N days
   */
  getUpcomingEvents(date: Date, days: number): CosmicEvent[] {
    const events: CosmicEvent[] = [];
    const endDate = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

    // Find next eclipse
    const eclipse = this.getNextEclipse(date);
    if (eclipse && eclipse.startTime <= endDate) {
      events.push(eclipse);
    }

    // Find moon phase events (full and new moons)
    let searchDate = new Date(date);
    while (searchDate < endDate) {
      const fullMoon = Astronomy.SearchMoonPhase(180, searchDate, 30);
      if (fullMoon && fullMoon.date <= endDate) {
        events.push(this.createFullMoonEvent(fullMoon.date));
        searchDate = new Date(fullMoon.date.getTime() + 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Sort by start time
    events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return events;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private angleToPhase(angle: number): MoonPhase {
    // Angle is 0-360 where 0=new, 180=full
    if (angle < 22.5 || angle >= 337.5) return "new";
    if (angle < 67.5) return "waxing_crescent";
    if (angle < 112.5) return "first_quarter";
    if (angle < 157.5) return "waxing_gibbous";
    if (angle < 202.5) return "full";
    if (angle < 247.5) return "waning_gibbous";
    if (angle < 292.5) return "last_quarter";
    return "waning_crescent";
  }

  private isDaytime(
    date: Date,
    sunrise: Date | null,
    sunset: Date | null,
  ): boolean {
    if (!sunrise || !sunset) {
      // Default to simple time check if no data
      const hour = date.getHours();
      return hour >= 6 && hour < 18;
    }

    const now = date.getTime();
    return now >= sunrise.getTime() && now < sunset.getTime();
  }

  private isMoonVisible(date: Date, phaseAngle: number): boolean {
    // Simplified: moon is visible when illumination > 5%
    // and it's nighttime (roughly)
    const hour = date.getHours();
    const isNight = hour < 6 || hour >= 18;

    // Moon is more visible when fuller
    const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;
    return isNight && illumination > 0.05;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private getNextSolstice(
    date: Date,
    year: number,
  ): { type: "solstice"; date: Date; name: string } {
    const seasons = Astronomy.Seasons(year);
    return {
      type: "solstice",
      date: seasons.jun_solstice.date,
      name: "Solsticio de Verano",
    };
  }

  private getNextEquinox(
    date: Date,
    year: number,
  ): { type: "equinox"; date: Date; name: string } {
    const seasons = Astronomy.Seasons(year);
    return {
      type: "equinox",
      date: seasons.mar_equinox.date,
      name: "Equinoccio de Primavera",
    };
  }

  private createFullMoonEvent(date: Date): CosmicEvent {
    return {
      id: `full-moon-${date.toISOString()}`,
      type: "lunar_phase",
      name: "Luna Llena",
      emoji: "🌕",
      description: "La Luna brilla en su maxima expresion",
      startTime: new Date(date.getTime() - 12 * 60 * 60 * 1000),
      endTime: new Date(date.getTime() + 12 * 60 * 60 * 1000),
      peakTime: date,
      intensity: 1.0,
      multipliers: {
        human: 0.15,
        animal: 0.25,
        robot: -0.1,
        mystic: 0.25,
        alien: 0.1,
      },
    };
  }

  private createSolsticeEvent(date: Date, seasonData: SeasonData): CosmicEvent {
    const isSummer =
      seasonData.current === "spring" || seasonData.current === "summer";
    return {
      id: `solstice-${date.toISOString()}`,
      type: "solstice",
      name: isSummer ? "Solsticio de Verano" : "Solsticio de Invierno",
      emoji: isSummer ? "☀️" : "❄️",
      description: isSummer
        ? "El dia mas largo del ano"
        : "La noche mas larga del ano",
      startTime: new Date(date.getTime() - 12 * 60 * 60 * 1000),
      endTime: new Date(date.getTime() + 12 * 60 * 60 * 1000),
      peakTime: date,
      intensity: 1.0,
      multipliers: isSummer
        ? { human: 0.25, animal: 0.15, robot: -0.15, mystic: 0.1, alien: -0.1 }
        : { human: -0.1, animal: -0.1, robot: 0.25, mystic: 0.15, alien: 0.1 },
      isCritical: true,
    };
  }

  private createEquinoxEvent(date: Date): CosmicEvent {
    return {
      id: `equinox-${date.toISOString()}`,
      type: "equinox",
      name: "Equinoccio",
      emoji: "🌗",
      description: "Dia y noche en perfecto equilibrio",
      startTime: new Date(date.getTime() - 12 * 60 * 60 * 1000),
      endTime: new Date(date.getTime() + 12 * 60 * 60 * 1000),
      peakTime: date,
      intensity: 0.8,
      multipliers: {
        human: 0.1,
        animal: 0.1,
        robot: 0,
        mystic: 0.15,
        alien: 0.1,
      },
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let providerInstance: ICosmicProvider | null = null;

export function getCosmicProvider(): ICosmicProvider {
  if (!providerInstance) {
    providerInstance = new AstronomyEngineProvider();
  }
  return providerInstance;
}

/**
 * Allow swapping the provider (for testing or future API changes)
 */
export function setCosmicProvider(provider: ICosmicProvider): void {
  providerInstance = provider;
}
