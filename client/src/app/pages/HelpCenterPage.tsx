import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { cmsApi } from "@/services/api";
import { toast } from "sonner";

export function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      title: "Orders & Shipping",
      icon: "📦",
      topics: ["Track my order", "Shipping options", "Delivery times", "Order status"],
    },
    {
      title: "Returns & Refunds",
      icon: "↩️",
      topics: ["Return policy", "Refund process", "Exchange items", "Return shipping"],
    },
    {
      title: "Payment & Pricing",
      icon: "💳",
      topics: ["Payment methods", "Pricing info", "Coupons & discounts", "Billing issues"],
    },
    {
      title: "Account & Security",
      icon: "🔐",
      topics: ["Reset password", "Account settings", "Security tips", "Privacy settings"],
    },
    {
      title: "Products",
      icon: "🛍️",
      topics: ["Product info", "Size guides", "Product care", "Availability"],
    },
    {
      title: "Technical Support",
      icon: "⚙️",
      topics: ["Website issues", "App support", "Browser compatibility", "Mobile app"],
    },
  ];

  const defaultFaqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Click on any order to view detailed tracking information. You'll also receive tracking updates via email and SMS.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like personalized products, intimate apparel, and perishables are non-returnable. Check the product page for specific return eligibility.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 5-7 business days. Express shipping takes 2-3 business days. Orders are processed within 24 hours on business days. Free shipping is available on orders over ₹50.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with SSL encryption.",
    },
    {
      question: "How do I apply a coupon code?",
      answer: "Enter your coupon code at checkout in the 'Promo Code' field and click 'Apply'. The discount will be reflected in your order total. Only one coupon code can be used per order. Check our Rewards & Coupons page for available offers.",
    },
    {
      question: "Can I change or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After that, orders enter processing and cannot be changed. Contact customer support immediately if you need to make changes.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we ship within the United States and Canada. International shipping to select countries is coming soon. Sign up for our newsletter to be notified when international shipping becomes available.",
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. The link expires after 24 hours for security reasons.",
    },
  ];

  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string; category?: string }>>(defaultFaqs);

  useEffect(() => {
    cmsApi.getFaqs().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setFaqs(data.map((f: any) => ({ question: f.question, answer: f.answer, category: f.category || "" })));
      }
    }).catch((err) => console.error("CMS FAQs load error:", err));
  }, []);

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      availability: "Mon-Fri, 9AM-6PM EST",
      action: "Start Chat",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us at 1-800-NAASHYOL",
      availability: "Mon-Fri, 9AM-8PM EST",
      action: "Call Now",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@NAASHYOL.com",
      availability: "Response within 24 hours",
      action: "Send Email",
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [tutorialsModalOpen, setTutorialsModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [sendingTicket, setSendingTicket] = useState(false);

  const filteredFaqs = faqs.filter((faq) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      if (faq.category && faq.category.toLowerCase().includes(catLower)) {
        return true;
      }
      if (catLower.includes("order") || catLower.includes("shipping")) {
        return faq.question.toLowerCase().includes("order") || faq.question.toLowerCase().includes("shipping") || faq.question.toLowerCase().includes("track") || (faq.category || "").toLowerCase().includes("order");
      }
      if (catLower.includes("return") || catLower.includes("refund")) {
        return faq.question.toLowerCase().includes("return") || faq.question.toLowerCase().includes("refund") || (faq.category || "").toLowerCase().includes("return");
      }
      if (catLower.includes("payment") || catLower.includes("pricing")) {
        return faq.question.toLowerCase().includes("payment") || faq.question.toLowerCase().includes("coupon") || faq.question.toLowerCase().includes("pricing") || (faq.category || "").toLowerCase().includes("payment");
      }
      if (catLower.includes("account")) {
        return faq.question.toLowerCase().includes("password") || faq.question.toLowerCase().includes("account") || (faq.category || "").toLowerCase().includes("account");
      }
      if (faq.category) {
        return faq.category.toLowerCase() === catLower;
      }
    }
    return true;
  });

  const handleTopicClick = (topic: string, catTitle: string) => {
    if (topic.toLowerCase().includes("track")) {
      router.push("/orders");
      return;
    }
    if (topic.toLowerCase().includes("return policy") || topic.toLowerCase().includes("refund")) {
      setSelectedCategory("Returns & Refunds");
      setSearchQuery("return");
      scrollToFaqs();
      return;
    }
    if (topic.toLowerCase().includes("coupon")) {
      router.push("/account");
      return;
    }
    if (topic.toLowerCase().includes("password")) {
      router.push("/login");
      return;
    }
    if (topic.toLowerCase().includes("product info") || topic.toLowerCase().includes("size")) {
      router.push("/products");
      return;
    }
    if (topic.toLowerCase().includes("website issues") || topic.toLowerCase().includes("technical")) {
      setChatModalOpen(true);
      return;
    }
    setSelectedCategory(catTitle);
    setSearchQuery(topic);
    scrollToFaqs();
  };

  const scrollToFaqs = () => {
    document.getElementById("faqs-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactAction = (action: string) => {
    if (action === "Start Chat") {
      setChatModalOpen(true);
    } else if (action === "Call Now") {
      window.location.href = "tel:18006227496";
    } else if (action === "Send Email") {
      window.location.href = "mailto:support@naashyol.com?subject=Customer%20Support%20Inquiry";
    }
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Please fill out both subject and message");
      return;
    }
    setSendingTicket(true);
    try {
      // Simulate ticket creation
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Support ticket submitted successfully!", {
        description: "Our support team will reply within 24 hours.",
      });
      setTicketSubject("");
      setTicketMessage("");
      setChatModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to send message: " + (err.message || "Error"));
    } finally {
      setSendingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent pb-24 md:pb-0">
      {/* Hero Header with Glassmorphic Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 dark:from-orange-600 dark:to-orange-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-inverse drop-shadow-lg">How can we help you?</h1>
            <p className="text-base md:text-lg text-inverse/90 mb-8">
              Search our help center or browse categories below
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for answers, orders, returns, payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-14 text-base sm:text-lg bg-background dark:bg-card border-0 text-foreground shadow-lg rounded-2xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Browse by Category
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Click any topic to view corresponding help articles or navigate
              </p>
            </div>
            {selectedCategory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="text-xs"
              >
                Clear Category Filter ✕
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                onClick={() => {
                  setSelectedCategory(category.title);
                  scrollToFaqs();
                }}
                className={`p-6 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-2 ${
                  selectedCategory === category.title
                    ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                    : "hover:border-[var(--primary-color)]/40"
                }`}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center justify-between">
                  <span>{category.title}</span>
                  <span className="text-xs text-[var(--primary-color)] font-semibold">View articles →</span>
                </h3>
                <ul className="space-y-2.5">
                  {category.topics.map((topic, topicIndex) => (
                    <li
                      key={topicIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicClick(topic, category.title);
                      }}
                      className="text-sm text-muted-foreground hover:text-[var(--primary-color)] font-medium transition-colors cursor-pointer flex items-center gap-1.5 group"
                    >
                      <span className="text-[var(--primary-color)] group-hover:translate-x-0.5 transition-transform">•</span>
                      <span className="group-hover:underline">{topic}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs Section */}
        <div id="faqs-section" className="mb-16 scroll-mt-24">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              {selectedCategory && (
                <p className="text-sm text-[var(--primary-color)] font-semibold mt-1">
                  Showing articles for category: {selectedCategory}
                </p>
              )}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {filteredFaqs.length} question(s) found
            </span>
          </div>

          <Card className="divide-y dark:divide-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-base">
                  No matching help articles found for "{searchQuery || selectedCategory}".
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-4"
                >
                  View All FAQs
                </Button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="p-6 transition-colors hover:bg-muted/30">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="size-5 text-[var(--primary-color)] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base bg-muted/40 p-4 rounded-xl">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Contact Options */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Still need help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="p-6 text-center rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="mb-4 flex justify-center">
                    <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
                      <Icon className={`size-8 ${option.color}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {option.availability}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleContactAction(option.action)}
                    className="w-full bg-[var(--primary-color)] hover:bg-orange-600 text-white font-semibold rounded-xl"
                  >
                    {option.action}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials Card */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-900 border border-orange-200 dark:border-gray-800 rounded-3xl shadow-sm">
          <div className="text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white">
              Guided Help
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Step-by-Step Shopping Guides
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Learn how to track orders, apply coupon codes, request hassle-free returns,
              and manage your profile address with ease.
            </p>
            <Button
              onClick={() => setTutorialsModalOpen(true)}
              variant="outline"
              className="bg-card hover:bg-muted font-semibold px-6 h-11 rounded-xl"
            >
              Watch Video Guides
            </Button>
          </div>
        </Card>
      </div>

      {/* Live Chat / Support Ticket Modal */}
      {chatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setChatModalOpen(false)}
        >
          <div
            className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                  <MessageCircle className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Live Customer Support</h3>
                  <p className="text-xs text-muted-foreground">Submit a quick message or ticket</p>
                </div>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Subject</label>
                <Input
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Order Tracking or Return Question"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Your Message / Query</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  rows={4}
                  required
                  className="w-full p-3 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChatModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendingTicket}
                  className="flex-1 bg-[var(--primary-color)] hover:bg-orange-600 text-white rounded-xl font-semibold"
                >
                  {sendingTicket ? "Sending..." : "Submit Query"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Guides Modal */}
      {tutorialsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setTutorialsModalOpen(false)}
        >
          <div
            className="bg-card rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Interactive Guides & Tutorials</h3>
              <button
                onClick={() => setTutorialsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/60 rounded-2xl border border-border">
                <h4 className="font-bold text-sm text-foreground mb-1">1. How to Track Your Order</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Log in to your account, click on "My Orders" from the top navigation, and select "Track" or "Details" on any pending or shipped order to see live real-time status.
                </p>
              </div>

              <div className="p-4 bg-muted/60 rounded-2xl border border-border">
                <h4 className="font-bold text-sm text-foreground mb-1">2. How to Request a Return</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Delivered orders can be returned within 30 days. Open "My Orders", click "Return", select the items and reason, and our courier will schedule pickup within 2-3 business days.
                </p>
              </div>

              <div className="p-4 bg-muted/60 rounded-2xl border border-border">
                <h4 className="font-bold text-sm text-foreground mb-1">3. Applying Promo Coupons</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  On the Checkout page, enter your coupon code in the "Have a Coupon Code?" box and click Apply. The discount will instantly recalculate your order total.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t">
              <Button
                onClick={() => setTutorialsModalOpen(false)}
                className="w-full bg-[var(--primary-color)] hover:bg-orange-600 text-white font-semibold rounded-xl"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


