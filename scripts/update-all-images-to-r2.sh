#!/bin/bash

# Script to update all image references to R2 URLs
# Base R2 URL
R2_BASE="https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public"

echo "Updating image references to R2..."

# Update data/data.ts - replace /photo and /olga patterns
sed -i "s|"/photo([0-9]*IS[0-9]*).webp"|"/photo1.webp"|g" app/data/data.ts
sed -i "s|"/photo[0-9]*(section[0-9]*).jpg"|"/photo1.jpg"|g" app/data/data.ts
sed -i "s|"/olgaphoto[0-9]*.jpeg"|"/olgaphoto0.jpg"|g" app/data/data.ts 2>/dev/null || true
sed -i "s|/olgaphoto|\"$R2_BASE\"/olgaphoto|g" app/data/data.ts
sed -i "s|/airbnb\.jpeg|"$R2_BASE"/airbnb.jpeg|g" app/data/data.ts
sed -i "s|/airbnb2\.jpeg|"$R2_BASE"/airbnb2.jpeg|g" app/data/data.ts
sed -i "s|/photo1IndexSection2\.webp|"$R2_BASE"/photo1IndexSection2.webp|g" app/data/data.ts

# Update data/carouseldata.ts
sed -i "s|\"/photo\([0-9]*IS[0-9]*\)\.webp\"|\""$R2_BASE"/photo\1.webp\"|g" app/data/carouseldata.ts

# Update data/data.json
sed -i "s|\"/photo\([0-9]*IS[0-9]*\)\.webp\"|\""$R2_BASE"/photo\1.webp\"|g" app/data/data.json
sed -i "s|\"/photo[0-9]*\(section[0-9]*\)\.jpg\"|\""$R2_BASE"/photo\1.jpg\"|g" app/data/data.json
sed -i "s|\"/olgaphoto[0-9]*\.jpeg\"|\""$R2_BASE"/olgaphoto.jpg\"|g" app/data/data.json 2>/dev/null || true
sed -i "s|\"/airbnb\.jpeg\"|\""$R2_BASE"/airbnb.jpeg\"|g" app/data/data.json
sed -i "s|\"/airbnb2\.jpeg\"|\""$R2_BASE"/airbnb2.jpeg\"|g" app/data/data.json

# Update routes/_index.tsx - og:image and twitter:image
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/_index.tsx
sed -i "s|/images/logonuevoolga\.png|"$R2_BASE"/logonuevoolga.png|g" app/routes/_index.tsx

# Update routes/legal.tsx
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/legal.tsx

# Update routes/valencia-things-to-do.tsx
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/valencia-things-to-do.tsx

# Update routes/book.tsx
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/book.tsx

# Update routes/index.tsx
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/index.tsx

# Update routes/pages.\$slug.tsx
sed -i "s|https://tourtovalencia\.com/tourtovalenciablackbg\.webp|"$R2_BASE"/tourtovalenciablackbg.webp|g" app/routes/pages.\$slug.tsx

# Update routes/admin.dashboard.pagegen.hooks.ts
sed -i "s|/olgaphoto3\.jpeg|"$R2_BASE"/olgaphoto3.jpeg|g" app/routes/admin.dashboard.pagegen.hooks.ts

# Update components/_index/IndexSection1.tsx
sed -i "s|/photo1section1\.jpg|"$R2_BASE"/photo1section1.jpg|g" app/components/_index/IndexSection1.tsx

# Update components/_index/HeroSection.tsx
sed -i "s|/hero3\.jpg|"$R2_BASE"/hero3.jpg|g" app/components/_index/HeroSection.tsx
sed -i "s|/hero1\.webp|"$R2_BASE"/hero1.webp|g" app/components/_index/HeroSection.tsx
sed -i "s|/hero2\.jpg|"$R2_BASE"/hero2.jpg|g" app/components/_index/HeroSection.tsx

# Update components/_sanjuan/SanJuanSection3Dynamic.tsx
sed -i "s|/hero1\.webp|"$R2_BASE"/hero1.webp|g" app/components/_sanjuan/SanJuanSection3Dynamic.tsx

# Update components/_sanjuan/SanJuanSection2.hooks.ts
sed -i "s|/hero1\.webp|"$R2_BASE"/hero1.webp|g" app/components/_sanjuan/SanJuanSection2.hooks.ts

# Update app/root.tsx - favicon
sed -i "s|/favicon\.png|"$R2_BASE"/favicon.png|g" app/root.tsx
sed -i "s|/favicon-192\.png|"$R2_BASE"/favicon-192.png|g" app/root.tsx
sed -i "s|/favicon-512\.png|"$R2_BASE"/favicon-512.png|g" app/root.tsx
sed -i "s|/apple-touch-icon\.png|"$R2_BASE"/apple-touch-icon.png|g" app/root.tsx

echo "Done!"
