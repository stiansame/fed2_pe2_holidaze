import mark from '../assets/holidaze-mark.svg';

export default function Logo() {
  return <span className="inline-flex items-center gap-2">
    <img src={mark} alt="" width="48" height="36" />
    <span className="text-h3 font-bold">Holidaze</span>
  </span>;
}
