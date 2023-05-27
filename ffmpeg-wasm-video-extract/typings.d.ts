declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
declare module '@tencent/easy-ffmpeg';

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}
