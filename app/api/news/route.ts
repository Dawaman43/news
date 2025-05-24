import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "general"
  const search = searchParams.get("search") || ""

  const API_KEY = process.env.NEWS_API_KEY

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    let url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}&pageSize=12`

    if (search) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(search)}&sortBy=publishedAt&apiKey=${API_KEY}&pageSize=12&language=en`
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "NewsHub/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`)
    }

    const data = await response.json()

    // Filter out articles with missing essential data
    const validArticles =
      data.articles?.filter(
        (article: any) =>
          article.title && article.description && article.title !== "[Removed]" && article.description !== "[Removed]",
      ) || []

    return NextResponse.json({
      articles: validArticles,
      totalResults: data.totalResults,
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
