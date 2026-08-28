'use client';

import { useState } from 'react';
import GoalInputScreen from '@/components/goals/goal-input-screen';
import {
  getLanguageForState,
  LANGUAGE_LABELS,
  type LanguageCode,
} from '@/lib/language/language';
import { ODISHA_DISTRICTS } from '@/lib/location/districts';
import {
  LocationResolutionError,
  resolveLocation,
  type Location,
} from '@/lib/location/resolve-location';

type ScreenStep = 'landing' | 'manual' | 'success' | 'continued' | 'goal';

function UmangLogo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="UMANG Government Services">
      <svg
        aria-hidden="true"
        className="h-9 w-9 shrink-0"
        fill="none"
        viewBox="0 0 40 40"
      >
        <rect width="40" height="40" rx="10" fill="#08458F" />
        <path
          d="M10 12.5v7.8c0 7.1 4.2 11.2 10 11.2s10-4.1 10-11.2v-7.8"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="3.2"
        />
        <path d="M10 12.5h6" stroke="#FFB91D" strokeLinecap="round" strokeWidth="3.2" />
        <path d="M24 12.5h6" stroke="#55B95D" strokeLinecap="round" strokeWidth="3.2" />
        <circle cx="20" cy="12.5" r="2.2" fill="#F36A3D" />
      </svg>
      <div className="leading-none">
        <span className="block text-[17px] font-bold tracking-[0.11em] text-[#083f82]">
          UMANG
        </span>
        <span className="mt-1 block text-[8px] font-semibold tracking-[0.13em] text-[#6b7890]">
          GOVERNMENT SERVICES
        </span>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function LocationPinIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        d="M16 29s9-8.3 9-17A9 9 0 1 0 7 12c0 8.7 9 17 9 17Z"
        fill="currentColor"
      />
      <circle cx="16" cy="12" r="3.5" fill="white" />
    </svg>
  );
}

function LocateIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2.75" fill="currentColor" />
      <path
        d="M16 3v5M16 24v5M3 16h5M24 16h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function MapIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        d="m3.5 8.5 7-3 11 3 7-3v18l-7 3-11-3-7 3v-18Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M10.5 5.5v18M21.5 8.5v18" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M16 18s4.2-4 4.2-8.1a4.2 4.2 0 1 0-8.4 0C11.8 14 16 18 16 18Z"
        fill="white"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="16" cy="9.8" r="1.35" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-30"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function CheckIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        d="m8 16.5 5.2 5L24.5 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function CivicIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto w-full max-w-[360px] text-[#55a6fa]"
      fill="none"
      viewBox="0 0 620 290"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        <path d="M20 260h580" />
        <path d="M70 260v-60h32v60M77 211h9v10h-9zM77 232h9v10h-9z" />
        <path d="M102 260v-40h36v40M111 230h8v10h-8M125 230h8v10h-8" />
        <path d="M158 260v-58h42v58M154 202h50l-5-11h-39l-6 11ZM169 216h10v11h-10M184 216h10v11h-10" />
        <path d="M254 260v-94h150v94M240 166h178v-18H240v18ZM278 148v-23h103v23" />
        <path d="M290 125v-25c0-35 20-57 39-57s39 22 39 57v25" />
        <path d="M310 100c0-12 8-21 19-21s19 9 19 21M329 79V41M329 41V15M329 15h27l-7 12 7 12h-27" />
        <path d="M269 260v-55h26v55M363 260v-55h26v55M313 260v-45c0-11 7-19 16-19s16 8 16 19v45" />
        <path d="M270 181h18v13h-18M370 181h18v13h-18M311 125h36v23h-36" />
        <path d="M438 260v-50h38v50M447 220h8v10h-8M461 220h8v10h-8" />
        <path d="M505 260v-62M487 228l18-41 18 41M492 216h26M496 206h18" />
        <path d="M548 260v-31M548 229c-14 0-20-10-20-20s8-19 20-19 20 9 20 19-7 20-20 20Z" />
        <path d="M72 91c-13 0-17-17-5-22 5-13 25-13 31 0 14-1 19 20 4 22H72ZM500 91c-13 0-17-17-5-22 5-13 25-13 31 0 14-1 19 20 4 22h-30Z" />
      </g>
    </svg>
  );
}

export default function LocationScreen() {
  const [step, setStep] = useState<ScreenStep>('landing');
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');

  function openManualSelection() {
    setMessage(null);
    setSelectedState('');
    setSelectedDistrict('');
    setStep('manual');
  }

  function handleAutomaticLocation() {
    setMessage(null);

    if (!navigator.geolocation) {
      setMessage(
        'Location is not supported by this browser. Select your location manually.'
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resolvedLocation = await resolveLocation(
            coords.latitude,
            coords.longitude
          );
          setLocation(resolvedLocation);
          setLanguage(getLanguageForState(resolvedLocation.state));
          setStep('success');
        } catch (error) {
          const detail =
            error instanceof LocationResolutionError
              ? error.message
              : 'Automatic location lookup could not be completed.';
          setMessage(`${detail} Select your location manually.`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        const detail =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : error.code === error.TIMEOUT
              ? 'Location detection timed out.'
              : 'Your location could not be detected.';
        setMessage(`${detail} Select your location manually.`);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: 10000,
      }
    );
  }

  function confirmManualLocation() {
    if (!selectedState || !selectedDistrict) {
      return;
    }

    setLocation({ state: selectedState, district: selectedDistrict });
    setLanguage(getLanguageForState(selectedState));
    setMessage(null);
    setStep('success');
  }

  function renderLanding() {
    return (
      <div className="w-full max-w-[390px] text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f1fd] text-[#2458d8]">
          <LocationPinIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-[27px] font-bold leading-tight tracking-[-0.025em] text-[#071426] sm:text-[29px]">
          Let&apos;s find your location
        </h1>
        <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-6 text-[#526b91]">
          We use your location to show government support relevant to your state and district.
        </p>

        {message ? (
          <div
            className="mt-5 rounded-xl border border-[#e9b86d] bg-[#fff8e9] px-4 py-3 text-left text-sm leading-5 text-[#70470d]"
            role="alert"
          >
            {message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <button
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[11px] bg-gradient-to-r from-[#0b3d83] to-[#074a9c] px-4 text-[15px] font-semibold text-white shadow-[0_7px_16px_rgba(7,66,145,0.16)] transition hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#2e72d5] disabled:cursor-wait disabled:opacity-75"
            disabled={isLocating}
            onClick={handleAutomaticLocation}
            type="button"
          >
            {isLocating ? <SpinnerIcon /> : <LocateIcon />}
            {isLocating ? 'Finding your location...' : 'Enable location'}
          </button>
          <button
            className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[11px] border border-[#79a2d5] bg-white px-4 text-[15px] font-semibold text-[#07499d] transition hover:bg-[#f3f8ff] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#2e72d5]"
            onClick={openManualSelection}
            type="button"
          >
            <MapIcon />
            Select location manually
          </button>
        </div>
        <p className="mx-auto mt-6 max-w-[320px] text-[13px] leading-5 text-[#315b94]">
          Your location is used only to personalise this prototype experience.
        </p>
      </div>
    );
  }

  function renderManualSelection() {
    return (
      <div className="w-full max-w-[390px]">
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#e6f1ff] text-[#2458d8]">
          <MapIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.025em] text-[#071426]">
          Select your location
        </h1>
        <p className="mt-2.5 text-base leading-6 text-[#526b91]">
          Choose your state first, then select your district.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#1f3656]">State</span>
            <select
              className="min-h-12 w-full rounded-lg border-2 border-[#9bb6d9] bg-[#f7f9fc] px-3.5 text-sm font-medium text-[#10213a] outline-none transition focus:border-[#2458d8] focus:ring-4 focus:ring-[#dbe9ff]"
              onChange={(event) => {
                setSelectedState(event.target.value);
                setSelectedDistrict('');
              }}
              value={selectedState}
            >
              <option className="bg-white text-[#10213a]" value="">
                Select state
              </option>
              <option className="bg-white text-[#10213a]" value="Odisha">
                Odisha
              </option>
            </select>
          </label>

          {selectedState === 'Odisha' ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#1f3656]">District</span>
              <select
                className="min-h-12 w-full rounded-lg border-2 border-[#9bb6d9] bg-[#f7f9fc] px-3.5 text-sm font-medium text-[#10213a] outline-none transition focus:border-[#2458d8] focus:ring-4 focus:ring-[#dbe9ff]"
                onChange={(event) => setSelectedDistrict(event.target.value)}
                value={selectedDistrict}
              >
                <option className="bg-white text-[#10213a]" value="">
                  Select district
                </option>
                {ODISHA_DISTRICTS.map((district) => (
                  <option
                    className="bg-white text-[#10213a]"
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <button
          className="mt-6 min-h-12 w-full rounded-lg bg-[#0b438f] px-5 text-base font-semibold text-white transition hover:bg-[#073975] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#2e72d5] disabled:cursor-not-allowed disabled:bg-[#a8b7ca]"
          disabled={!selectedState || !selectedDistrict}
          onClick={confirmManualLocation}
          type="button"
        >
          Confirm location
        </button>
        <button
          className="mt-4 w-full text-sm font-semibold text-[#2458a6] underline-offset-4 hover:underline"
          onClick={() => {
            setMessage(null);
            setStep('landing');
          }}
          type="button"
        >
          Back to location options
        </button>
      </div>
    );
  }

  function renderSuccess() {
    const isContinued = step === 'continued';

    return (
      <div className="w-full max-w-[390px] text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f6ec] text-[#157347]">
          <CheckIcon className="h-9 w-9" />
        </div>
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.025em] text-[#071426]">
          {isContinued ? 'Location confirmed' : 'Location established'}
        </h1>
        <p className="mt-2.5 text-base leading-6 text-[#526b91]">
          {isContinued
            ? 'Your location is ready for the next setup step.'
            : 'Please confirm the location we will use for this experience.'}
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#b6cbe6] bg-[#f6f9fd] text-left shadow-[0_8px_18px_rgba(36,88,166,0.07)]">
          <div className="border-b border-[#d6e2f1] px-5 py-3.5">
            <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-[#6780a2]">
              State
            </span>
            <span className="mt-0.5 block text-lg font-semibold text-[#10213a]">
              {location?.state}
            </span>
          </div>
          <div className="px-5 py-3.5">
            <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-[#6780a2]">
              District
            </span>
            <span className="mt-0.5 block text-lg font-semibold text-[#10213a]">
              {location?.district}
            </span>
          </div>
        </div>

        {!isContinued ? (
          <button
            className="mt-6 min-h-12 w-full rounded-lg bg-[#0b438f] px-5 text-base font-semibold text-white transition hover:bg-[#073975] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#2e72d5]"
            onClick={() => setStep('goal')}
            type="button"
          >
            Continue
          </button>
        ) : null}
        <button
          className="mt-4 w-full text-sm font-semibold text-[#2458a6] underline-offset-4 hover:underline"
          onClick={openManualSelection}
          type="button"
        >
          Change location
        </button>
      </div>
    );
  }

  if (step === 'goal') {
    return (
      <GoalInputScreen
        language={language}
        location={location ?? undefined}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <main className="min-h-screen flex-1 bg-white px-4 py-4 sm:px-8">
      <header className="mx-auto flex h-11 w-full max-w-[1080px] items-center justify-between">
        <UmangLogo />
        <div className="relative flex h-9 items-center rounded-lg border border-[#c9d5e4] bg-white pl-3 pr-2 text-[#24466e] shadow-sm">
          <GlobeIcon />
          <select
            aria-label="Language"
            className="h-full appearance-none bg-transparent pl-2 pr-5 text-xs font-semibold text-[#24466e] outline-none"
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            value={language}
          >
            <option value="en">{LANGUAGE_LABELS.en}</option>
            <option value="or">{LANGUAGE_LABELS.or}</option>
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-2 h-3 w-3"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </header>

      <section className="mx-auto mt-6 grid w-full max-w-[960px] overflow-hidden rounded-[20px] border border-[#9db9dd] bg-white shadow-[0_18px_46px_rgba(20,55,95,0.18)] lg:h-[560px] lg:grid-cols-2">
        <div
          className="flex min-h-[420px] flex-col px-9 py-9 text-white sm:px-11 lg:min-h-0 lg:px-14 lg:py-11"
          style={{
            background:
              'radial-gradient(circle at 54% 36%, #09509c 0%, #06468d 48%, #003a79 100%)',
          }}
        >
          <div>
            <p className="text-[13px] font-semibold tracking-[0.14em] text-[#d5e5ff]">
              UMANG SERVICES
            </p>
            <h2 className="mt-4 max-w-[370px] text-[33px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[36px]">
              Services that meet you where you are.
            </h2>
            <p className="mt-5 max-w-[370px] text-[15px] leading-6 text-[#edf5ff]">
              Start with your state and district so we can make the experience relevant to you.
            </p>
            <div className="mt-5 h-1.5 w-20 rounded-full bg-[#ffc329]" />
          </div>
          <div className="mt-auto pt-6">
            <CivicIllustration />
          </div>
        </div>

        <div className="flex min-h-[520px] items-center justify-center bg-white px-7 py-9 sm:px-10 lg:min-h-0 lg:px-10 lg:py-8">
          {step === 'landing' ? renderLanding() : null}
          {step === 'manual' ? renderManualSelection() : null}
          {step === 'success' || step === 'continued' ? renderSuccess() : null}
        </div>
      </section>
    </main>
  );
}
