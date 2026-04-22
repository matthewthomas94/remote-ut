"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, AlertTriangle, CheckCircle2, ExternalLink, Plus, Lock, Check } from "lucide-react"
import Image from "next/image"

interface PrototypeFlowProps {
  participantName: string
  variant: "control" | "test"
  onFinish?: () => void
}

export default function PrototypeFlow({ participantName, variant, onFinish }: PrototypeFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [entityType, setEntityType] = useState("")
  const [businessSearch, setBusinessSearch] = useState("")
  const [industry, setIndustry] = useState("")
  const [revenue, setRevenue] = useState("")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")
  const [noWebsite, setNoWebsite] = useState(false)
  const [showSmsToast, setShowSmsToast] = useState(false)

  const handleNext = () => {
    if (currentScreen === 4) {
      setShowSmsToast(true)
      setTimeout(() => {
        setCurrentScreen(5)
      }, 2000)
    } else {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1)
      setShowSmsToast(false)
    }
  }

  const shouldShowAlert = (screen: number) => {
    if (variant === "control") {
      return screen === 4 || screen === 5
    } else {
      return screen === 5
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Image src="/pay-logo.svg" alt="pay.com.au" width={120} height={32} className="h-8 w-auto" />
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto flex-shrink-0">
          <nav className="space-y-1">
            <div className={`flex items-center gap-3 py-2 ${currentScreen >= 2 ? "text-gray-900" : "text-[#3b5998]"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentScreen >= 2 ? "bg-[#3b5998] text-white" : "bg-[#3b5998] text-white"
                }`}
              >
                {currentScreen >= 2 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="font-medium text-sm">Business entity</span>
              {currentScreen === 1 && <Lock className="ml-auto w-4 h-4 text-gray-400" />}
            </div>

            {currentScreen >= 1 && (
              <div className="ml-9 py-1">
                <div className="text-sm text-gray-600">Find your business</div>
              </div>
            )}

            <div
              className={`flex items-center gap-3 py-2 ${
                currentScreen >= 4
                  ? "text-gray-900"
                  : currentScreen >= 2 && currentScreen <= 3
                    ? "text-[#3b5998]"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentScreen >= 4
                    ? "bg-[#3b5998] text-white"
                    : currentScreen >= 2 && currentScreen <= 3
                      ? "bg-[#3b5998] text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentScreen >= 4 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className="font-medium text-sm">Business details</span>
            </div>

            {currentScreen >= 2 && (
              <div className="ml-9 space-y-1 py-1">
                <div className={`text-sm ${currentScreen === 2 ? "text-gray-900" : "text-gray-600"}`}>
                  Industry and revenue
                </div>
                <div className={`text-sm ${currentScreen === 3 ? "text-gray-900" : "text-gray-600"}`}>
                  Address and online presence
                </div>
              </div>
            )}

            <div className={`flex items-center gap-3 py-2 ${currentScreen >= 4 ? "text-[#3b5998]" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentScreen >= 4 ? "bg-[#3b5998] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="font-medium text-sm">ID and business verification</span>
            </div>

            {currentScreen >= 4 && (
              <div className="ml-9 py-1">
                <div className="text-sm text-gray-900">Verify your identity</div>
                {currentScreen >= 4 && (
                  <>
                    <div className="text-sm text-gray-400">Business ownership details</div>
                    <div className="text-sm text-gray-400">Verify beneficial owners</div>
                  </>
                )}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-12 max-w-2xl">
            {/* Screen 1: Find your business */}
            {currentScreen === 1 && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Business entity</h1>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold mb-2 text-gray-900">Entity type</h2>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      You may need to submit relevant business documents for verification, depending on your business
                      entity type.
                    </p>
                    <a href="#" className="text-sm text-[#3b5998] hover:underline font-medium">
                      I don't know my entity type
                    </a>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 bg-card">
                    <Label className="text-sm font-medium mb-4 block text-gray-900">
                      What type of entity is your business?
                    </Label>
                    <RadioGroup value={entityType} onValueChange={setEntityType} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="font-normal cursor-pointer text-sm text-gray-900">
                          Company
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="sole-trader" id="sole-trader" />
                        <Label htmlFor="sole-trader" className="font-normal cursor-pointer text-sm text-gray-900">
                          Sole Trader
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="trust" id="trust" />
                        <Label htmlFor="trust" className="font-normal cursor-pointer text-sm text-gray-900">
                          Trust
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="partnership" id="partnership" />
                        <Label htmlFor="partnership" className="font-normal cursor-pointer text-sm text-gray-900">
                          Partnership
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal cursor-pointer text-sm text-gray-900">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Find your business</h2>
                  <div className="border border-gray-200 rounded-lg p-6 bg-card">
                    <Label className="text-sm mb-3 block text-gray-900 leading-relaxed">
                      Search by entering your business name or Australian Business Number (ABN).
                    </Label>
                    <Input
                      placeholder="A real ABN is not required for this field"
                      value={businessSearch}
                      onChange={(e) => setBusinessSearch(e.target.value)}
                      className="mb-3 bg-white text-gray-900"
                    />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Can't find your business?{" "}
                      <a href="#" className="text-[#3b5998] hover:underline font-medium">
                        Contact our support team
                      </a>{" "}
                      for help.
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 leading-relaxed">
                  By proceeding you confirm that you accept the{" "}
                  <a href="#" className="text-[#3b5998] hover:underline font-medium">
                    Terms & Conditions
                  </a>
                  .
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="text-sm bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={handleNext} className="bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Screen 2: Industry and revenue */}
            {currentScreen === 2 && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Business details</h1>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-semibold mb-4 text-gray-900">Industry</h2>
                    <div className="border border-gray-200 rounded-lg p-6 bg-card">
                      <Label className="text-sm font-medium mb-3 block text-gray-900">
                        What industry does your business operate in?
                      </Label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b5998] focus:border-transparent"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      >
                        <option value="">Please select an industry</option>
                        <option value="retail">Retail</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="professional">Professional Services</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold mb-2 text-gray-900">Monthly revenue</h2>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      We collect this information to personalise your experience and help you get the most out of your
                      payments.
                    </p>
                    <div className="border border-gray-200 rounded-lg p-6 bg-card">
                      <Label className="text-sm font-medium mb-4 block text-gray-900">
                        What is your estimated monthly revenue?
                      </Label>
                      <RadioGroup value={revenue} onValueChange={setRevenue} className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="less-10k" id="less-10k" />
                          <Label htmlFor="less-10k" className="font-normal cursor-pointer text-sm">
                            Less than $10,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="10k-50k" id="10k-50k" />
                          <Label htmlFor="10k-50k" className="font-normal cursor-pointer text-sm">
                            $10,000 to $50,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="50k-200k" id="50k-200k" />
                          <Label htmlFor="50k-200k" className="font-normal cursor-pointer text-sm">
                            $50,000 to $200,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="200k-500k" id="200k-500k" />
                          <Label htmlFor="200k-500k" className="font-normal cursor-pointer text-sm">
                            $200,000 to $500,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="500k-1m" id="500k-1m" />
                          <Label htmlFor="500k-1m" className="font-normal cursor-pointer text-sm">
                            $500,000 to $1,000,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="1m-5m" id="1m-5m" />
                          <Label htmlFor="1m-5m" className="font-normal cursor-pointer text-sm">
                            $1,000,000 to $5,000,000
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="over-5m" id="over-5m" />
                          <Label htmlFor="over-5m" className="font-normal cursor-pointer text-sm">
                            Over $5,000,000
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="text-sm bg-transparent">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Screen 3: Address and online presence */}
            {currentScreen === 3 && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Business details</h1>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-semibold mb-2 text-gray-900">Address</h2>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      Help us understand the location from where you conduct most of your business. You can update this
                      later if your address changes.
                    </p>
                    <a href="#" className="text-sm text-[#3b5998] hover:underline mb-4 inline-block font-medium">
                      Which address should I provide?
                    </a>
                    <div className="border border-gray-200 rounded-lg p-6 text-card bg-card">
                      <Label className="text-sm font-medium mb-3 block text-gray-900">
                        What is your principal place of business?
                      </Label>
                      <Input
                        placeholder="A real address is not required for this field"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-white text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold mb-2 text-gray-900">Website</h2>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Providing links to your business websites, online store, or social media helps us verify your
                      account quickly.
                    </p>
                    <div className="border border-gray-200 rounded-lg p-6 space-y-4 text-card bg-card">
                      <div>
                        <Label className="text-sm font-medium mb-3 block text-gray-900">
                          What is your business website?
                        </Label>
                        <Input
                          placeholder="http://www.example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="bg-white text-gray-900"
                        />
                      </div>
                      <button className="flex items-center gap-2 text-sm text-[#3b5998] hover:underline font-medium">
                        <Plus className="w-4 h-4" />
                        Add another website
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-website"
                      checked={noWebsite}
                      onCheckedChange={(checked) => setNoWebsite(checked as boolean)}
                    />
                    <Label htmlFor="no-website" className="text-sm font-normal cursor-pointer">
                      I don't have a website or online presence
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="text-sm bg-transparent">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm">
                    Save and continue
                  </Button>
                </div>
              </div>
            )}

            {/* Screen 4: Biometrics initial */}
            {currentScreen === 4 && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">ID and business verification</h1>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold mb-2 text-gray-900">
                      Verify your identity as {participantName}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      To open an account, we compare your ID to a selfie to ensure someone else is not using your
                      details to open an account. If you are not a{" "}
                      <a href="#" className="text-[#3b5998] hover:underline font-medium">
                        beneficial owner
                      </a>
                      , you will not be able to open an account.
                    </p>
                    <a href="#" className="text-sm text-[#3b5998] hover:underline font-medium">
                      I'm not a beneficial owner
                    </a>
                  </div>

                  {shouldShowAlert(4) && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <AlertDescription className="text-sm text-amber-900 leading-relaxed">
                        <strong className="font-semibold">Please have physical documents ready for verification</strong>
                        <br />
                        In order to proceed with identity verification you will need a physical copy of your documents.{" "}
                        <strong className="font-semibold">
                          Any photos of screenshots of documents will not pass our verification process.
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border border-gray-200 rounded-lg p-6 text-card bg-card">
                    <h3 className="font-semibold mb-3 text-gray-900">Continue on your mobile device</h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      We'll send a link via SMS to your mobile number ending in ****5678 so you can verify your identity
                      with Incode.
                    </p>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Once you've finished, you will be able to continue in this window.
                    </p>
                    <a
                      href="#"
                      className="text-sm text-[#3b5998] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      Learn more about Incode
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="text-sm bg-transparent">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm">
                    Send SMS
                  </Button>
                </div>

                {showSmsToast && (
                  <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-sm animate-in slide-in-from-top z-50">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">SMS sent</p>
                      <p className="text-sm text-gray-600">Please click the link in the SMS we sent to your mobile.</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Screen 5: Biometrics interim */}
            {currentScreen === 5 && (
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Continue on your mobile device</h1>

                <div className="space-y-6">
                  <p className="text-lg text-gray-900 font-medium">
                    Once you've finished we'll take you to the next step.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your Incode link will expire in 24 hours. Please keep this window open until you finish and avoid
                    refreshing this page.
                  </p>

                  {shouldShowAlert(5) && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <AlertDescription className="text-sm text-amber-900 leading-relaxed">
                        <strong className="font-semibold">Please have physical documents ready for verification</strong>
                        <br />
                        In order to proceed with identity verification you will need a physical copy of your documents.{" "}
                        <strong className="font-semibold">
                          Any photos of screenshots of documents will not pass our verification process.
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border border-gray-200 rounded-lg p-8 bg-card">
                    <div className="flex items-center gap-12">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-4 text-gray-900">For best results:</h3>
                        <ul className="space-y-2.5 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Ensure your camera lens is clean</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Be in a space with good lighting</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Avoid glare and reflections</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Do not use your camera flash</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Ensure you are using a physical document for verification</span>
                          </li>
                        </ul>
                      </div>
                      <div className="flex-shrink-0">
                        <Image
                          src="/verification-confirmation.svg"
                          alt="Verification confirmation"
                          width={240}
                          height={240}
                          className="w-60 h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="text-sm bg-transparent">
                    Back
                  </Button>
                  <Button onClick={onFinish} className="bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm">
                    Finish test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
