"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ExternalLink, Search, TrendingUp, Globe, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  author: string
}

interface NewsResponse {
  articles: Article[]
  totalResults: number
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("general")

  const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

  const categories = [
    { id: "general", name: "General", icon: Globe },
    { id: "technology", name: "Technology", icon: Zap },
    { id: "business", name: "Business", icon: TrendingUp },
    { id: "health", name: "Health", icon: Clock },
    { id: "science", name: "Science", icon: Search },
    { id: "sports", name: "Sports", icon: ExternalLink },
  ]

  const fetchNews = async (searchTerm = "", selectedCategory = "general") => {
    if (!API_KEY) {
      console.error("NewsAPI key not found")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/news?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: NewsResponse = await response.json()

      if (data.articles) {
        setArticles(data.articles)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(searchQuery, category)
  }, [category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNews(searchQuery, category)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NewsHub
                </h1>
                <p className="text-sm text-gray-500">Stay informed, stay ahead</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white/80 transition-all duration-300"
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const IconComponent = cat.icon
            return (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                onClick={() => setCategory(cat.id)}
                className={`transition-all duration-300 transform hover:scale-105 ${
                  category === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/80"
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {cat.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* News Grid */}
      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden bg-white/50 backdrop-blur-sm border-white/20">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card
                key={index}
                className="group overflow-hidden bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {article.urlToImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.urlToImage || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      {article.source.name}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>

                  <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3 text-gray-600">{article.description}</CardDescription>

                  {article.author && <p className="text-sm text-gray-500">By {article.author}</p>}

                  <Link href={article.url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                    >
                      Read Full Article
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/30 backdrop-blur-sm border-t border-white/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Powered by{" "}
            <Link href="https://newsapi.org" target="_blank" className="text-blue-600 hover:text-blue-700 font-medium">
              NewsAPI
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
