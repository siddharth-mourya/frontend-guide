# Image Optimization

## ⚡ Quick Revision
- **Next.js Image**: Built-in `<Image>` component with automatic optimization
- **Automatic Optimization**: WebP/AVIF conversion, lazy loading, responsive sizing
- **Performance Benefits**: Reduced bundle size, faster loading, better Core Web Vitals
- **Image Domains**: Configure `remotePatterns` for external images
- **Fill Mode**: Use `fill` prop for responsive containers
- **Loader Configuration**: Custom image optimization services

```javascript
import Image from 'next/image';

// Basic usage with required props
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority={true} // LCP image
/>

// Responsive image with fill
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/background.jpg"
    alt="Background"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>

// External image with domain config
<Image
  src="https://images.unsplash.com/photo-1234"
  alt="External image"
  width={400}
  height={300}
/>

// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};
```

**Common Pitfalls:**
- Not setting `priority={true}` for above-the-fold images
- Using regular `<img>` tags instead of Next.js Image
- Not configuring domains for external images

---

## 🧠 Deep Understanding

<details>
<summary>Why this exists</summary>
**Performance Impact:**
- Images often represent 50-60% of website payload
- Unoptimized images cause layout shifts (CLS)
- Manual optimization is time-consuming and error-prone

**Core Web Vitals:**
- Largest Contentful Paint (LCP): Faster loading of hero images
- Cumulative Layout Shift (CLS): Prevents layout shifts with size hints
- First Input Delay (FID): Reduced JavaScript execution from smaller bundles

**User Experience:**
- Progressive loading with lazy loading by default
- Better perceived performance on slow connections
- Responsive images for different screen sizes
</details>

<details>
<summary>How it works</summary>
**Optimization Pipeline:**
1. **Build Time**: Static images processed and optimized
2. **Runtime**: Dynamic resizing based on device pixel ratio
3. **Format Selection**: WebP/AVIF when supported, fallback to original
4. **Lazy Loading**: Images loaded when entering viewport
5. **Caching**: Optimized images cached for subsequent requests

**Image Processing:**
```javascript
// Automatic format conversion
<Image src="/image.jpg" /> 
// Serves as WebP/AVIF when supported

// Responsive sizing
<Image
  src="/hero.jpg"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{
    width: '100%',
    height: 'auto',
  }}
  width={1200}
  height={800}
/>

// Custom loader for external services
const cloudinaryLoader = ({ src, width, quality }) => {
  return `https://res.cloudinary.com/demo/image/fetch/w_${width},q_${quality || 75}/${src}`
}

<Image
  loader={cloudinaryLoader}
  src="https://example.com/image.jpg"
  alt="External image"
  width={800}
  height={600}
/>
```

**Image Variants Generated:**
- Multiple sizes based on common device resolutions
- Different formats (WebP, AVIF, original)
- Quality optimization based on connection speed
- Blur placeholder for smooth loading

```javascript
// Advanced configuration
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```
</details>

<details>
<summary>Common misconceptions</summary>
**"Next.js Image makes images larger"**
- It actually reduces bundle size through optimization
- Multiple formats and sizes are generated, browser chooses best

**"width and height props control display size"**
- They provide aspect ratio and prevent layout shift
- Use CSS for actual display dimensions

**"All images are automatically lazy loaded"**
- Above-the-fold images should use `priority={true}`
- This disables lazy loading for critical images

**"External images don't need configuration"**
- `remotePatterns` must be configured for security
- External images still get optimization benefits
</details>

<details>
<summary>Interview angle</summary>
**Performance Questions:**
- "How do you optimize images for Core Web Vitals?"
- "What's the difference between lazy loading and priority loading?"
- "How would you implement progressive image loading?"

**Technical Implementation:**
```javascript
// Art direction with different crops
<Image
  src="/hero-desktop.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  style={{
    width: '100%',
    height: 'auto',
  }}
/>

// Image with blur placeholder
import heroImage from '/public/hero.jpg';

<Image
  src={heroImage}
  alt="Hero"
  placeholder="blur" // Automatic blur placeholder
  priority
/>

// Custom placeholder
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
/>
```

**Real-world Scenarios:**
- E-commerce product galleries with multiple images
- Blog posts with dynamic image content
- User-generated content with unknown image sizes

**Architecture Decisions:**
- When to use external image services vs built-in optimization
- CDN strategies for global image delivery
- Image storage and processing pipeline design

**Debugging and Monitoring:**
- Tools for measuring image performance impact
- Identifying unoptimized images in production
- A/B testing image optimization strategies
</details>