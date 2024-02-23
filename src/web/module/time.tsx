import React, { useEffect, useRef } from 'react';
import { TrackDetails, useKeenSlider } from 'keen-slider/react';
import { KeenSliderOptions } from 'keen-slider';

export default function Wheel(props: {
  length: number;
  width: number;
  loop?: boolean;
  perspective?: 'left' | 'center';
  initIdx?: number;
  label?: string;
  setValue?: (idx: number, abs: number) => string;
  onChange?: (idx?: number) => void;
}) {
  const perspective = props.perspective || 'center';
  const wheelSize = 20;
  const slides = props.length;
  const slideDegree = 360 / wheelSize;
  const slidesPerView = props.loop ? 9 : 1;
  const [sliderState, setSliderState] = React.useState<TrackDetails | null>(
    null
  );
  const size = useRef(0);
  const options = useRef({
    slides: {
      number: slides,
      origin: props.loop ? 'center' : ('auto' as 'center' | 'auto'),
      perView: slidesPerView
    },

    vertical: true,

    initial: props.initIdx || 0,
    loop: props.loop,
    dragSpeed: (val) => {
      const height = size.current;
      return (
        val *
        (height /
          ((height / 2) * Math.tan(slideDegree * (Math.PI / 180))) /
          slidesPerView)
      );
    },
    created: (s) => {
      size.current = s.size;
    },
    updated: (s) => {
      size.current = s.size;
    },
    detailsChanged: (s) => {
      setSliderState(s.track.details);
    },
    slideChanged: (s) => {
      if (props.onChange) props.onChange(s.track.details.abs);
    },
    rubberband: !props.loop,
    mode: 'free-snap'
  } as KeenSliderOptions);

  const [sliderRef, slider] = useKeenSlider(options.current);

  const [radius, setRadius] = React.useState(0);

  React.useEffect(() => {
    if (slider.current) setRadius(slider.current.size / 2);
  }, [slider]);

  function slideValues() {
    if (!sliderState) return [];
    const offset = props.loop ? 1 / 2 - 1 / slidesPerView / 2 : 0;

    const values = [];
    for (let i = 0; i < slides; i++) {
      const distance = sliderState
        ? (sliderState.slides[i].distance - offset) * slidesPerView
        : 0;
      const rotate =
        Math.abs(distance) > wheelSize / 2
          ? 180
          : distance * (360 / wheelSize) * -1;
      const style = {
        transform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
        WebkitTransform: `rotateX(${rotate}deg) translateZ(${radius}px)`
      };
      const value = props.setValue
        ? props.setValue(i, sliderState.abs + Math.round(distance))
        : i;
      values.push({ style, value });
    }
    return values;
  }

  return (
    <div
      className={'wheel keen-slider wheel--perspective-' + perspective}
      ref={sliderRef}
    >
      <div
        className="wheel__shadow-top"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`
        }}
      />
      <div className="wheel__inner">
        <div className="wheel__slides" style={{ width: props.width + 'px' }}>
          {slideValues().map(({ style, value }, idx) => (
            <div className="wheel__slide" style={style} key={idx}>
              <span>{value}</span>
            </div>
          ))}
        </div>
        {props.label && (
          <div
            className="wheel__label"
            style={{
              transform: `translateZ(${radius}px)`,
              WebkitTransform: `translateZ(${radius}px)`
            }}
          >
            {props.label}
          </div>
        )}
      </div>
      <div
        className="wheel__shadow-bottom"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`
        }}
      />
    </div>
  );
}

export const Time = ({
  value,
  onChange
}: {
  value: Date;
  onChange: (date: Date) => void;
}) => {
  const hours = useRef(value.getHours());
  const minutes = useRef(value.getMinutes());
  useEffect(() => {
    hours.current = value.getHours();
    minutes.current = value.getMinutes();
  }, [value]);

  return (
    <div
      style={{
        height: '240px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff'
      }}
    >
      <div style={{ width: 70, height: 180 }}>
        <Wheel
          initIdx={hours.current}
          length={24}
          width={23}
          loop={true}
          onChange={(abs) => {
            const date = new Date();
            date.setHours(abs ?? 0);
            date.setMinutes(minutes.current);
            onChange(date);
          }}
        />
      </div>
      <div style={{ width: 70, height: 180 }}>
        <Wheel
          initIdx={minutes.current}
          length={60}
          width={23}
          perspective="left"
          onChange={(abs) => {
            const date = new Date();
            date.setHours(hours.current);
            date.setMinutes(abs ?? 0);
            onChange(date);
          }}
        />
      </div>
    </div>
  );
};
