# 🛍️ Shopper Agent - AI-Powered Multi-Store Shopping Assistant

An intelligent shopping assistant powered by AI that helps users discover products, place orders, and track shipments across multiple e-commerce platforms - all through natural conversation.

![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-18.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC)

## ✨ Features

- 🤖 **AI-Powered Chat Interface** - Natural language conversations powered by Grok AI to understand user intent
- 🔍 **Smart Keyword Extraction** - Grok AI extracts relevant keywords, categories, and price ranges from user queries
- 🏪 **Multi-Store Integration** - Seamlessly search across multiple e-commerce platforms
- 🖼️ **Product Discovery** - Browse products with images, descriptions, and real-time pricing
- ⭐ **Intelligent Sorting** - Products sorted by relevance, ratings, reviews, and price
- 🛒 **Smart Order Placement** - Place orders through conversational AI with complete order details
- 📦 **Order Tracking** - Track order status with order numbers
- 🎨 **Modern UI** - Beautiful, responsive design with shadcn/ui components
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal speed

## 🏗️ Architecture

The application integrates with multiple e-commerce backends:

### Integrated Stores

1. **Style Hub** 
   - Backend API: `https://backend-xi-murex-46.vercel.app/api/external`
   - Frontend: `https://stylehub-showcase.vercel.app`
   - Specializes in traditional and ethnic wear

2. **LuxeWear**
   - API: `https://style-suite-express.vercel.app/api/v1`
   - Modern fashion and accessories

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SahilGarg15/Shopper-Agent.git
   cd Shopper-Agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure API Keys**
   
   Create a `.env.local` file in the root directory:
   ```env
   GROK_API_KEY=your-grok-api-key-here
   ```

   Update the store API configuration in `app/config/sites.ts`:
   ```typescript
   export const sites: Record<string, SiteConfig> = {
     site1: {
       name: "Style Hub",
       baseUrl: "https://backend-xi-murex-46.vercel.app",
       apiKey: "your-api-key-here",
       apiKeyHeader: "X-API-Key",
       apiVersion: "external",
       orderPath: "/api/external/orders",
       imageBaseUrl: "https://stylehub-showcase.vercel.app"
     },
     site2: {
       name: "LuxeWear",
       baseUrl: "https://style-suite-express.vercel.app",
       apiKey: "your-api-key-here",
       apiKeyHeader: "x-api-key",
       apiVersion: "v1",
       orderPath: "/api/v1/orders"
     }
   }
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
shopping-agent/
├── app/
│   ├── api/           # API routes for backend integration
│   │   ├── auth/      # Authentication endpoints
│   │   ├── orders/    # Order management
│   │   └── products/  # Product fetching
│   ├── config/        # Configuration files
│   │   └── sites.ts   # Multi-store configuration
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Main chat interface
│   └── globals.css    # Global styles
├── components/
│   ├── ui/            # Reusable UI components (shadcn/ui)
│   └── theme-provider.tsx
├── hooks/             # Custom React hooks
├── lib/              # Utility functions
└── public/           # Static assets
```

## 🎯 Usage Examples

### Browse Products with AI Understanding
```
User: "Show me traditional kurtas under 2000 rupees"
AI: *Grok extracts: keywords=['traditional','kurta'], priceRange={max:2000}*
    *Displays kurtas sorted by ratings and price*
```

### Smart Search with Multiple Criteria
```
User: "I want a blue silk kurta for men"
AI: *Grok extracts: keywords=['blue','silk','kurta','men'], category='men'*
    *Shows matching products sorted by relevance, ratings, and price*
```

### Place an Order
```
User: "I want to buy the Blue Silk Kurta"
AI: "Great choice! The Royal Blue Silk Kurta is ₹2,499. 
     Would you like to place an order?"
User: "Yes"
AI: *Opens order form with product details*
```

### Track Orders
```
User: "Track order ORD-123456"
AI: *Shows order status, items, and shipping information*
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI Integration**: Grok AI (xAI) for natural language understanding
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Hooks
- **HTTP Client**: Native Fetch API
- **Form Handling**: React Hook Form + Zod

## 🧠 AI-Powered Search

The application uses **Groq AI** (LLaMA 3.3 70B) to intelligently process user queries:

### How It Works

1. **User Input**: User types a natural language query
2. **Groq Processing**: Query is sent to Groq API which extracts:
   - **Exact Keywords** (distinguishes "shirt" from "t-shirt", "dress" from "kurta")
   - Category (men, women, kids, accessories)
   - Price range (if mentioned)
   - User intent (search, order, track)
3. **Smart Matching**: Products are matched using:
   - **Word boundary matching** (prevents partial matches)
   - Keyword relevance (weighted scoring)
   - Average ratings (higher rated products ranked higher)
   - Review count (popular products get boost)
   - Price (sorted ascending for equal matches)
4. **Intelligent Sorting**: Results sorted by:
   - Relevance score (exact matches prioritized)
   - Product ratings (★★★★★)
   - Number of reviews
   - Price (lower to higher)

### Scoring System

- **Exact word match in name**: +4 points
- **Substring match in name**: +2 points  
- **Category match**: +2 points
- **Description match**: +1 point
- **Rating > 4 stars**: +3 points
- **Rating > 3.5 stars**: +2 points
- **Rating > 3 stars**: +1 point
- **Reviews > 100**: +2 points
- **Reviews > 50**: +1 point

### Visual Features

- ⭐ **Star Ratings**: Products display 1-5 star ratings
- 📊 **Review Count**: Number of customer reviews shown
- 💰 **Price Highlighting**: Clear price display for comparison
- 🏷️ **Stock Status**: In stock/Out of stock badges
- 🏪 **Store Tags**: Easy identification of product source

## 🔧 API Integration

### Adding a New Store

1. Update `app/config/sites.ts`:
   ```typescript
   site3: {
     name: "Your Store Name",
     baseUrl: "https://your-api.com",
     apiKey: "your-api-key",
     apiKeyHeader: "X-API-Key",
     apiVersion: "v1",
     orderPath: "/api/v1/orders",
     imageBaseUrl: "https://your-images.com" // optional
   }
   ```

2. Update `app/page.tsx` to fetch from the new site:
   ```typescript
   const [site1Response, site2Response, site3Response] = await Promise.all([
     fetch(`${API_URL}?limit=1000&site=site1`),
     fetch(`${API_URL}?limit=1000&site=site2`),
     fetch(`${API_URL}?limit=1000&site=site3`)
   ]);
   ```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sahil Garg**
- GitHub: [@SahilGarg15](https://github.com/SahilGarg15)

**Kunal Bhatia**
- GitHub: [@Kunalbhatia2601](https://github.com/kunalbhatia2601)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com) for hosting
- All the open-source libraries that made this project possible

---

Made with ❤️ using Next.js and AI
