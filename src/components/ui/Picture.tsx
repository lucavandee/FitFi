import { PictureHTMLAttributes } from 'react';

const Picture = (p: PictureHTMLAttributes<HTMLPicture Element>) => <picture {...p} />;

export default Picture;