import classnames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

export function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="918">
      <path
        d="M512 128c212.064 0 384 171.936 384 384s-171.936 384-384 384S128 724.064 128 512 299.936 128 512 128z m0 64C335.296 192 192 335.296 192 512s143.296 320 320 320 320-143.296 320-320S688.704 192 512 192z m6.848 429.728a48 48 0 1 1 0 96 48 48 0 0 1 0-96zM516.576 320a32 32 0 0 1 32 32v182.848a32 32 0 1 1-64 0V352a32 32 0 0 1 32-32z"
        fill="#111111"
        p-id="919"
      ></path>
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="668">
      <path
        d="M192 448c0-141.152 114.848-256 256-256s256 114.848 256 256-114.848 256-256 256-256-114.848-256-256z m710.624 409.376l-206.88-206.88A318.784 318.784 0 0 0 768 448c0-176.736-143.264-320-320-320S128 271.264 128 448s143.264 320 320 320a318.784 318.784 0 0 0 202.496-72.256l206.88 206.88 45.248-45.248z"
        fill="#181818"
        p-id="669"
      ></path>
    </svg>
  );
}

export function IconCross({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1821">
      <path
        d="M512 85.333333c235.637333 0 426.666667 191.029333 426.666667 426.666667S747.637333 938.666667 512 938.666667 85.333333 747.637333 85.333333 512 276.362667 85.333333 512 85.333333z m-86.474667 296.96a30.570667 30.570667 0 1 0-43.232 43.232L468.768 512l-86.474667 86.474667a30.570667 30.570667 0 1 0 43.232 43.232L512 555.232l86.474667 86.474667a30.570667 30.570667 0 1 0 43.232-43.232L555.232 512l86.474667-86.474667a30.570667 30.570667 0 1 0-43.232-43.232L512 468.768z"
        fill="#000000"
        p-id="1822"
      ></path>
    </svg>
  );
}

export function IconAll({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14Z"
        fill="#333"
      />
      <path
        d="M24 14C26.2091 14 28 12.2091 28 10C28 7.79086 26.2091 6 24 6C21.7909 6 20 7.79086 20 10C20 12.2091 21.7909 14 24 14Z"
        fill="#333"
      />
      <path
        d="M38 14C40.2091 14 42 12.2091 42 10C42 7.79086 40.2091 6 38 6C35.7909 6 34 7.79086 34 10C34 12.2091 35.7909 14 38 14Z"
        fill="#333"
      />
      <path
        d="M10 28C12.2091 28 14 26.2091 14 24C14 21.7909 12.2091 20 10 20C7.79086 20 6 21.7909 6 24C6 26.2091 7.79086 28 10 28Z"
        fill="#333"
      />
      <path
        d="M24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28Z"
        fill="#333"
      />
      <path
        d="M38 28C40.2091 28 42 26.2091 42 24C42 21.7909 40.2091 20 38 20C35.7909 20 34 21.7909 34 24C34 26.2091 35.7909 28 38 28Z"
        fill="#333"
      />
      <path
        d="M10 42C12.2091 42 14 40.2091 14 38C14 35.7909 12.2091 34 10 34C7.79086 34 6 35.7909 6 38C6 40.2091 7.79086 42 10 42Z"
        fill="#333"
      />
      <path
        d="M24 42C26.2091 42 28 40.2091 28 38C28 35.7909 26.2091 34 24 34C21.7909 34 20 35.7909 20 38C20 40.2091 21.7909 42 24 42Z"
        fill="#333"
      />
      <path
        d="M38 42C40.2091 42 42 40.2091 42 38C42 35.7909 40.2091 34 38 34C35.7909 34 34 35.7909 34 38C34 40.2091 35.7909 42 38 42Z"
        fill="#333"
      />
    </svg>
  );
}

export function IconDraft({ className, color = '#333' }: { className?: string; color?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="36" height="30" rx="2" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />
      <path d="M17.9497 24.0083L29.9497 24.0083" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 13L13 5H35L42 13" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDislike({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path fillRule="evenodd" clipRule="evenodd" d="M28 20L20 28L28 20Z" fill="none" />
      <path d="M28 20L20 28" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20 20.0001L28 28L20 20.0001Z" fill="none" />
      <path d="M20 20.0001L28 28" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSave({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4L29.2533 7.83204L35.7557 7.81966L37.7533 14.0077L43.0211 17.8197L41 24L43.0211 30.1803L37.7533 33.9923L35.7557 40.1803L29.2533 40.168L24 44L18.7467 40.168L12.2443 40.1803L10.2467 33.9923L4.97887 30.1803L7 24L4.97887 17.8197L10.2467 14.0077L12.2443 7.81966L18.7467 7.83204L24 4Z"
        fill="none"
        stroke="#333"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 24L22 29L32 19" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAi({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.57932 35.4207C5.32303 32.1826 4 28.2458 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24C44 35.0457 35.0457 44 24 44C19.7542 44 15.8174 42.677 12.5793 40.4207M7.57932 35.4207C8.93657 37.3685 10.6315 39.0634 12.5793 40.4207M7.57932 35.4207L16 27M12.5793 40.4207L21 32M16 27L20 23L25 28L21 32M16 27L21 32"
        stroke="#4a90e2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 14H21M19 12V16" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 17H34M31 14V20" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 29H36M34 27V31" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconKeywords({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
        fill="none"
        stroke="#4a90e2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 24H33" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 16.2056L28.5 31.794" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28.5 16.2056L19.5 31.794" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAiDesc({ className }: { className?: string }) {
  return (
    <svg className={cx('icon', className)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 32L19.1875 27M31 32L28.8125 27M19.1875 27L24 16L28.8125 27M19.1875 27H28.8125"
        stroke="#d0021b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43.1999 20C41.3468 10.871 33.2758 4 23.5999 4C13.9241 4 5.85308 10.871 4 20L10 18"
        stroke="#d0021b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 28C5.85308 37.129 13.9241 44 23.5999 44C33.2758 44 41.3468 37.129 43.1999 28L38 30"
        stroke="#d0021b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
