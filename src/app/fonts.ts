import localFont from 'next/font/local'

export const satoshi = localFont({
  src: [
    {
      path: 'fonts/satoshi/Satoshi-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: 'fonts/satoshi/Satoshi-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: 'fonts/satoshi/Satoshi-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: 'fonts/satoshi/Satoshi-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: 'fonts/satoshi/Satoshi-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})