"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Users, CreditCard, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            OneHealth
          </motion.div>
          <Link href="/login">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get Your Digital
              <span className="block bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                Health Card
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of families managing their health records digitally. Secure, accessible, and always with
              you.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg"
              >
                Get Started Today
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Health Card Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, 2, 0, -2, 0],
              }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6, ease: "easeInOut" }}
              className="perspective-1000"
            >
              <Card className="w-80 h-48 mx-auto bg-gradient-to-br from-white to-blue-50 shadow-2xl border-0">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">John Doe</h3>
                      <p className="text-sm text-gray-600">ID: OH-2024-001</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500">Valid Until</p>
                      <p className="font-semibold text-gray-800">Dec 2025</p>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Progress Counter */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="secondary" className="bg-white/20 text-white text-lg px-6 py-2 mb-4">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              10,000+ Cards Issued
            </motion.span>
          </Badge>
          <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, delay: 0.5 }}
              className="bg-green-400 h-2 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose OneHealth?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of healthcare management with our comprehensive digital platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Data Collection",
                description: "Your health data is encrypted and stored securely with bank-level security protocols.",
                delay: 0.1,
              },
              {
                icon: CreditCard,
                title: "Instant Digital Card",
                description: "Get your digital health card immediately after registration and payment confirmation.",
                delay: 0.2,
              },
              {
                icon: Users,
                title: "Family Accounts",
                description:
                  "Create sub-accounts for family members and manage everyone's health records in one place.",
                delay: 0.3,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get your digital health card in just 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register",
                description: "A data collector registers you with your basic information and health details.",
                icon: Users,
              },
              {
                step: "02",
                title: "Payment",
                description: "Make a secure payment through bKash or Nagad to activate your account.",
                icon: CreditCard,
              },
              {
                step: "03",
                title: "Get Card",
                description: "Receive your digital health card instantly with QR code and unique ID.",
                icon: Shield,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 relative overflow-hidden">
        {/* Wave Animation */}
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
              fill="rgba(59, 130, 246, 0.1)"
              animate={{
                d: [
                  "M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z",
                  "M0,80 C300,40 900,100 1200,80 L1200,120 L0,120 Z",
                  "M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z",
                ],
              }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">OneHealth</h3>
              <p className="text-gray-400">Revolutionizing healthcare management through digital innovation.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+880 1234-567890</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@onehealth.com</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Get Started</h4>
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Login Now</Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 OneHealth. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
