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
