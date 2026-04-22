"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  LifeBuoy,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react"
import { DIRECTORS, type DirectorId, type Scenario } from "@/lib/scenarios"

// ---------------------------------------------------------------------------
// Top-level state machine
//
// Onboarding screens (O1 → O4) feed into one of two terminal states:
//   - invited-dashboard   (O6): selected a director, confirmed ownership
//   - contact-dashboard   (O4-contact): clicked "Contact me to verify"
// Both are valid outcomes — they're the two choices the user test is measuring.
// ---------------------------------------------------------------------------

type Screen =
  | "welcome"
  | "entity"
  | "details"
  | "ownership"
  | "invited-dashboard"
  | "contact-dashboard"

type FlowState = {
  screen: Screen
  entity: { abn: string; businessFound: boolean; principalAddress: string }
  details: {
    industry: string
    monthlyRevenue: string
    website: string
    noOnlinePresence: boolean
    businessDescription: string
  }
  ownership: { selectedDirector: DirectorId | null; inviteEmail: string; confirmOpen: boolean }
  contact: { contactSupportOpen: boolean }
}

const INITIAL_STATE: FlowState = {
  screen: "welcome",
  entity: { abn: "", businessFound: false, principalAddress: "" },
  details: {
    industry: "",
    monthlyRevenue: "",
    website: "",
    noOnlinePresence: false,
    businessDescription: "",
  },
  ownership: { selectedDirector: null, inviteEmail: "", confirmOpen: false },
  contact: { contactSupportOpen: false },
}

const INDUSTRIES = [
  "Retail",
  "Hospitality",
  "Professional Services",
  "Technology",
  "Healthcare",
  "Construction",
  "Manufacturing",
  "Other",
]

const REVENUE_BANDS = [
  "Less than $10,000",
  "$10,000 to $50,000",
  "$50,000 to $200,000",
  "$200,000 to $500,000",
  "$500,000 to $1,000,000",
  "$1,000,000 to $5,000,000",
  "Over $5,000,000",
]

// ---------------------------------------------------------------------------

interface PrototypeFlowProps {
  participantName: string
  scenario: Scenario
  logEvent: (type: string, value?: unknown) => void
  onFinish: () => void
}

export default function PrototypeFlow({
  participantName,
  scenario,
  logEvent,
  onFinish,
}: PrototypeFlowProps) {
  const [state, setState] = useState<FlowState>(INITIAL_STATE)
  const firstName = useMemo(() => participantName.split(/\s+/)[0] || "there", [participantName])

  useEffect(() => {
    logEvent("prototype_screen", { screen: state.screen, scenario })
  }, [state.screen, scenario, logEvent])

  const goTo = (screen: Screen) => setState((s) => ({ ...s, screen }))

  // ------ welcome (O1)
  if (state.screen === "welcome") {
    return (
      <PayShell>
        <O1Welcome
          firstName={firstName}
          onCancel={() => logEvent("prototype_cancel_clicked", { at: "welcome" })}
          onContinue={() => {
            logEvent("prototype_welcome_continue")
            goTo("entity")
          }}
        />
      </PayShell>
    )
  }

  // ------ entity (O2)
  if (state.screen === "entity") {
    const canContinue =
      state.entity.businessFound && state.entity.principalAddress.trim().length > 0
    return (
      <PayShell>
        <OnboardingLayout step={1}>
          <h1 className="text-[34px] font-bold tracking-tight text-[#283E48] mb-8">
            Business entity
          </h1>

          <Section
            title="Find your business"
            subtitle="Search by entering your business name or Australian Business Number (ABN)."
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={state.entity.abn}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    entity: {
                      ...s.entity,
                      abn: e.target.value,
                      businessFound: e.target.value.trim().length > 0,
                    },
                  }))
                }
                onFocus={() => logEvent("prototype_abn_focus")}
                placeholder="Start typing"
                className="pl-9 h-[58px] text-base"
              />
            </div>

            {!state.entity.businessFound && (
              <p className="text-sm text-muted-foreground mt-3">
                Can't find your business?{" "}
                <a
                  href="#"
                  className="text-[#3866B0] hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact our support team
                </a>{" "}
                for help.
              </p>
            )}

            {state.entity.businessFound && <BusinessFoundCard />}
          </Section>

          <Section
            title="What is your principal place of business?"
            subtitle="Help us understand the location from where you conduct most of your business. You can update this later if your address changes."
          >
            <Input
              value={state.entity.principalAddress}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  entity: { ...s.entity, principalAddress: e.target.value },
                }))
              }
              placeholder="Start typing an address"
              className="h-[58px] text-base"
            />
          </Section>

          <p className="text-sm text-muted-foreground mt-10">
            By proceeding you confirm that you accept the{" "}
            <a
              href="#"
              className="text-[#3866B0] hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Terms &amp; Conditions
            </a>
            .
          </p>

          <ButtonRow
            primary={
              <Button
                disabled={!canContinue}
                onClick={() => {
                  logEvent("prototype_entity_submit", {
                    businessFound: state.entity.businessFound,
                    addressLength: state.entity.principalAddress.length,
                  })
                  goTo("details")
                }}
              >
                Save and continue
              </Button>
            }
            secondary={
              <Button
                variant="outline"
                onClick={() => logEvent("prototype_cancel_clicked", { at: "entity" })}
              >
                Cancel
              </Button>
            }
          />
        </OnboardingLayout>
      </PayShell>
    )
  }

  // ------ details (O3)
  if (state.screen === "details") {
    const detailsValid =
      !!state.details.industry &&
      !!state.details.monthlyRevenue &&
      (state.details.noOnlinePresence
        ? state.details.businessDescription.trim().length > 0
        : state.details.website.trim().length > 0)

    return (
      <PayShell>
        <OnboardingLayout step={2}>
          <h1 className="text-[34px] font-bold tracking-tight text-[#283E48] mb-8">
            Business details
          </h1>

          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <Label className="text-base font-bold text-[#283E48]">
                What industry does your business operate in?
              </Label>
              <Select
                value={state.details.industry}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, details: { ...s.details, industry: v } }))
                }
              >
                <SelectTrigger className="h-[58px] text-base">
                  <SelectValue placeholder="Please select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold text-[#283E48]">
                What is your monthly revenue?
              </Label>
              <Select
                value={state.details.monthlyRevenue}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, details: { ...s.details, monthlyRevenue: v } }))
                }
              >
                <SelectTrigger className="h-[58px] text-base">
                  <SelectValue placeholder="Set monthly revenue" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_BANDS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!state.details.noOnlinePresence ? (
              <div className="space-y-2">
                <Label className="text-base font-bold text-[#283E48]">
                  What is your business website?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Providing links to your business websites, online store, or social media helps us
                  verify your account quickly.
                </p>
                <Input
                  value={state.details.website}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      details: { ...s.details, website: e.target.value },
                    }))
                  }
                  placeholder="http://www.example.com"
                  className="h-[58px] text-base"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[#3866B0] text-sm font-medium hover:underline"
                  onClick={() => logEvent("prototype_add_another_website_clicked")}
                >
                  <Plus className="w-4 h-4" />
                  Add another link
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-base font-bold text-[#283E48]">
                  In ten words can you tell us about what your business does?
                </Label>
                <Input
                  value={state.details.businessDescription}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      details: { ...s.details, businessDescription: e.target.value },
                    }))
                  }
                  placeholder="Business description"
                  className="h-[58px] text-base"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="no-online"
                checked={state.details.noOnlinePresence}
                onCheckedChange={(c) =>
                  setState((s) => ({
                    ...s,
                    details: { ...s.details, noOnlinePresence: c as boolean },
                  }))
                }
              />
              <label htmlFor="no-online" className="text-sm cursor-pointer">
                I don't have a website or online presence
              </label>
            </div>
          </div>

          <ButtonRow
            primary={
              <Button
                disabled={!detailsValid}
                onClick={() => {
                  logEvent("prototype_details_submit", {
                    industry: state.details.industry,
                    revenue: state.details.monthlyRevenue,
                    noOnlinePresence: state.details.noOnlinePresence,
                  })
                  goTo("ownership")
                }}
              >
                Save and continue
              </Button>
            }
            secondary={
              <Button variant="outline" onClick={() => goTo("entity")}>
                Back
              </Button>
            }
          />
        </OnboardingLayout>
      </PayShell>
    )
  }

  // ------ ownership (O4)
  if (state.screen === "ownership") {
    const selected = state.ownership.selectedDirector
    const selectedDirector = DIRECTORS.find((d) => d.id === selected) ?? null
    const canContinue = !!selected && state.ownership.inviteEmail.trim().length > 0

    return (
      <PayShell>
        <OnboardingLayout step={3}>
          <h1 className="text-[34px] font-bold tracking-tight text-[#283E48] mb-8">
            ID and business verification
          </h1>

          <h2 className="text-lg font-bold text-[#283E48] mb-2">Select the account owner</h2>
          <p className="text-[#526973] leading-relaxed mb-6">
            Thanks for your details thus far {firstName} please select a listed director to be the
            account owner so we can complete your application and get you started.
          </p>

          <div className="space-y-3 mb-6">
            {DIRECTORS.map((dir) => {
              const isSelected = state.ownership.selectedDirector === dir.id
              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      ownership: {
                        ...s.ownership,
                        selectedDirector: dir.id,
                        // Don't prefill — the participant types the real
                        // email so it's a deliberate action.
                      },
                    }))
                  }
                  className={`w-full flex items-center gap-4 p-5 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? "border-[#3866B0] bg-[#F3F6FD]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#D3DFF6] flex items-center justify-center text-[#3866B0] font-medium">
                    {dir.initial}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#283E48]">{dir.fullName}</div>
                    <div className="text-sm text-[#526973]">{dir.role}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#3866B0] bg-[#3866B0]" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedDirector && (
            <div className="space-y-2 mb-6">
              <Label htmlFor="invite-email" className="text-sm text-[#526973]">
                Email invite link
              </Label>
              <Input
                id="invite-email"
                value={state.ownership.inviteEmail}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    ownership: { ...s.ownership, inviteEmail: e.target.value },
                  }))
                }
                placeholder="Director email"
                className="h-[58px] text-base"
              />
            </div>
          )}

          <p className="text-[#526973] text-sm mb-3">
            If you aren't listed above but are a director, use the action below. Doing so will
            trigger our team to get in touch and verify.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              logEvent("prototype_contact_me_to_verify_clicked", { scenario })
              goTo("contact-dashboard")
            }}
          >
            Contact me to verify
          </Button>

          <ButtonRow
            primary={
              <Button
                disabled={!canContinue}
                onClick={() => {
                  logEvent("prototype_ownership_save_and_continue_clicked", {
                    director: state.ownership.selectedDirector,
                  })
                  setState((s) => ({
                    ...s,
                    ownership: { ...s.ownership, confirmOpen: true },
                  }))
                }}
              >
                Save and continue
              </Button>
            }
            secondary={
              <Button variant="outline" onClick={() => goTo("details")}>
                Back
              </Button>
            }
          />
        </OnboardingLayout>

        <ConfirmOwnershipDialog
          open={state.ownership.confirmOpen}
          participantName={participantName}
          selectedDirector={selectedDirector}
          inviteEmail={state.ownership.inviteEmail}
          onCancel={() => {
            logEvent("prototype_confirm_ownership_cancel")
            setState((s) => ({
              ...s,
              ownership: { ...s.ownership, confirmOpen: false },
            }))
          }}
          onConfirm={() => {
            logEvent("prototype_confirm_ownership_confirm", {
              director: state.ownership.selectedDirector,
            })
            setState((s) => ({
              ...s,
              ownership: { ...s.ownership, confirmOpen: false },
              screen: "invited-dashboard",
            }))
          }}
        />
      </PayShell>
    )
  }

  // ------ terminal: invited dashboard (O6)
  if (state.screen === "invited-dashboard") {
    const selectedDirector = DIRECTORS.find((d) => d.id === state.ownership.selectedDirector)
    return (
      <DashboardShell firstName={firstName} withToast>
        <InvitedDashboardBody
          firstName={firstName}
          director={selectedDirector ?? DIRECTORS[1]}
          onFinish={() => {
            logEvent("prototype_finish_clicked", { outcome: "invited" })
            onFinish()
          }}
        />
      </DashboardShell>
    )
  }

  // ------ terminal: contact-me dashboard
  return (
    <DashboardShell firstName={firstName}>
      <ContactDashboardBody
        onContactSupport={() => {
          logEvent("prototype_contact_support_clicked")
          setState((s) => ({ ...s, contact: { contactSupportOpen: true } }))
        }}
        onFinish={() => {
          logEvent("prototype_finish_clicked", { outcome: "contact-me" })
          onFinish()
        }}
      />
      <ContactSupportDialog
        open={state.contact.contactSupportOpen}
        onClose={() => setState((s) => ({ ...s, contact: { contactSupportOpen: false } }))}
      />
    </DashboardShell>
  )
}

// ---------------------------------------------------------------------------
// Shell + chrome components
// ---------------------------------------------------------------------------

function PayShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      <PayHeader />
      <div className="flex-1">{children}</div>
    </div>
  )
}

function PayHeader() {
  return (
    <header className="bg-white border-b border-[#E0E0E0] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#3866B0] rounded flex items-center justify-center">
          <span className="text-white font-bold">P</span>
        </div>
        <span className="font-bold text-[#283E48]">pay.com.au</span>
      </div>
      <Star className="w-5 h-5 text-[#BDBDBD]" />
    </header>
  )
}

function OnboardingLayout({ step, children }: { step: 1 | 2 | 3; children: ReactNode }) {
  return (
    <div className="max-w-[1024px] mx-auto flex gap-12 py-12 px-8">
      <Stepper active={step} />
      <div className="flex-1 max-w-[551px]">{children}</div>
    </div>
  )
}

function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Business entity" },
    { n: 2, label: "Business details" },
    { n: 3, label: "Business ownership" },
  ] as const
  return (
    <nav className="w-[200px] flex-shrink-0 pt-4">
      <ol className="space-y-4">
        {items.map((item) => {
          const done = item.n < active
          const current = item.n === active
          return (
            <li key={item.n} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  done || current ? "bg-[#3866B0] text-white" : "bg-[#E0E0E0] text-[#BDBDBD]"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : item.n}
              </div>
              <span
                className={
                  current || done
                    ? "text-[#283E48] font-medium text-sm"
                    : "text-[#BDBDBD] text-sm"
                }
              >
                {item.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-[#283E48] mb-1">{title}</h2>
      {subtitle && <p className="text-[#526973] text-sm leading-relaxed mb-4">{subtitle}</p>}
      {children}
    </div>
  )
}

function ButtonRow({ primary, secondary }: { primary: ReactNode; secondary: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-12 pt-8 border-t border-[#E0E0E0]">
      {secondary}
      {primary}
    </div>
  )
}

// ---------------------------------------------------------------------------
// O1
// ---------------------------------------------------------------------------

function O1Welcome({
  firstName,
  onCancel,
  onContinue,
}: {
  firstName: string
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <div className="flex-1 grid grid-cols-2 min-h-[calc(100vh-73px)]">
      <div className="flex items-center justify-center px-12 bg-white">
        <div className="max-w-[448px]">
          <h1 className="text-[34px] font-bold tracking-tight leading-tight text-[#283E48] mb-4">
            We're glad to have you here, {firstName}!
          </h1>
          <p className="text-[#526973] mb-6 leading-relaxed">
            Start getting more out of your payments by filling in a few details about your business.
          </p>
          <div className="h-px bg-[#E0E0E0] my-6" />
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-[#3866B0] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#283E48] text-sm">How long will this take?</div>
                <div className="text-[#526973] text-sm">
                  Complete your business profile in 5-10 mins
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <LifeBuoy className="w-6 h-6 text-[#3866B0] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#283E48] text-sm">
                  What information do I need?
                </div>
                <div className="text-[#526973] text-sm">
                  You'll need your business details and government-issued documents
                </div>
              </div>
            </li>
          </ul>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </div>
      </div>

      <div className="bg-[#F3F6FD] flex items-center justify-center p-8">
        <Card className="w-[624px] max-w-full aspect-[624/400] flex items-center justify-center text-[#526973] shadow-lg bg-white">
          <div className="text-center p-8">
            <div className="text-xs uppercase tracking-wider text-[#3866B0] font-bold mb-2">
              pay.com.au
            </div>
            <div className="text-[#283E48] font-bold text-xl mb-1">Welcome back</div>
            <div className="text-sm text-[#526973]">
              Your dashboard preview — once you've signed up you'll land here.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// O2 — business-found card
// ---------------------------------------------------------------------------

function BusinessFoundCard() {
  const rows: Array<[string, string]> = [
    ["ABN", "45 678 901 212"],
    ["Entity name", "NORTHWIND TRADING PTY LTD"],
    ["Entity type", "Company"],
    ["Location", "VIC, 3000"],
  ]
  return (
    <div className="mt-4 bg-white border border-[#E0E0E0] rounded-lg p-6">
      <div className="font-bold text-[#283E48] mb-4">We found your business!</div>
      <dl className="space-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[120px_1fr] gap-4">
            <dt className="text-[#526973]">{k}</dt>
            <dd className="font-medium text-[#283E48]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ---------------------------------------------------------------------------
// O4 — Confirm ownership modal
// ---------------------------------------------------------------------------

function ConfirmOwnershipDialog({
  open,
  participantName,
  selectedDirector,
  inviteEmail,
  onCancel,
  onConfirm,
}: {
  open: boolean
  participantName: string
  selectedDirector: (typeof DIRECTORS)[number] | null
  inviteEmail: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!selectedDirector) return null
  const allDirectorNames = DIRECTORS.map((d) => d.fullName).join(", ")
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#283E48]">
            Confirm ownership
          </DialogTitle>
          <DialogDescription className="text-[#526973] leading-relaxed pt-2">
            You are confirming that you are{" "}
            <span className="font-bold text-[#283E48]">{participantName}</span> and the account
            owner is{" "}
            <span className="font-bold text-[#283E48]">{selectedDirector.fullName}</span>. Please
            confirm these details are correct as you will not be able to change this.
          </DialogDescription>
        </DialogHeader>

        <dl className="text-sm space-y-4 border-t border-b border-[#E0E0E0] py-4 my-2">
          <div>
            <dt className="font-bold text-[#283E48]">Directors</dt>
            <dd className="text-[#526973]">{allDirectorNames}</dd>
          </div>
          <div>
            <dt className="font-bold text-[#283E48]">Account owner</dt>
            <dd className="text-[#526973]">{selectedDirector.fullName}</dd>
          </div>
          <div>
            <dt className="font-bold text-[#283E48]">Invite email</dt>
            <dd className="text-[#526973]">{inviteEmail}</dd>
          </div>
          <div>
            <dt className="font-bold text-[#283E48]">Invite link</dt>
            <dd className="flex items-center gap-2">
              <a
                href="#"
                className="text-[#3866B0] hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                tiny.url/?12dlfnwez
              </a>
              <button
                type="button"
                className="text-[#526973] hover:text-[#283E48]"
                onClick={(e) => e.preventDefault()}
                aria-label="Copy invite link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </dd>
          </div>
        </dl>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Dashboard shell (shared by invited + contact terminal states)
// ---------------------------------------------------------------------------

function DashboardShell({
  firstName,
  withToast,
  children,
}: {
  firstName: string
  withToast?: boolean
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex">
      <DashboardSideNav />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-[#E0E0E0] h-16 flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3866B0] rounded flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-[#283E48]">pay.com.au</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-[#3866B0] font-medium">Rewards →</button>
            <div className="w-8 h-8 rounded-full bg-[#D3DFF6] flex items-center justify-center text-[#3866B0] font-medium text-sm">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-12 relative">
          <h1 className="text-[34px] font-bold tracking-tight text-[#283E48] mb-8">
            Welcome, {firstName}.
          </h1>
          {children}
          {withToast && <InviteSentToast />}
        </div>
      </div>
    </div>
  )
}

function DashboardSideNav() {
  const items = [
    "Dashboard",
    "Make a payment",
    "Payments",
    "Payees",
    "PayWallet",
    "Settings",
    "Activity log",
  ]
  return (
    <aside className="w-[240px] bg-gradient-to-b from-[#3866B0] to-[#003C80] text-white flex flex-col">
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-white/20 flex items-center justify-center font-bold">
          MB
        </div>
        <div className="font-bold">My Business</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item, i) => (
          <a
            key={item}
            href="#"
            onClick={(e) => e.preventDefault()}
            className={`block px-3 py-2 rounded text-sm ${
              i === 0 ? "bg-white/10 font-medium" : "text-white/70 hover:bg-white/5"
            }`}
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="p-3">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="block px-4 py-3 rounded bg-white/10 hover:bg-white/20 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <Gift className="w-4 h-4" /> Earn 10,000 points
          </span>
        </a>
      </div>
    </aside>
  )
}

function InvitedDashboardBody({
  firstName,
  director,
  onFinish,
}: {
  firstName: string
  director: (typeof DIRECTORS)[number]
  onFinish: () => void
}) {
  // Give them a beat to absorb the outcome before the "continue" is live.
  const [canFinish, setCanFinish] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setCanFinish(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="max-w-[1088px] space-y-6">
      <div className="text-sm font-medium text-[#526973]">
        Your account is awaiting verification
      </div>

      <Card className="p-6">
        <div className="font-bold text-[#283E48] mb-3">What's next?</div>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <p className="text-[#526973] leading-relaxed max-w-[700px]">
              You've invited <span className="font-bold text-[#283E48]">{director.fullName}</span>{" "}
              to complete this application. Once they accept, they'll be able to finish onboarding
              and then assign {firstName} a role for this account.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-4 inline-flex items-center gap-1 text-[#3866B0] hover:underline text-sm font-medium"
            >
              Learn more about roles <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Card>

      <div>
        <div className="text-sm font-bold text-[#283E48] mb-3">Invite sent to:</div>
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold text-[#283E48]">{director.fullName}</div>
              <div className="text-[#526973]">Director</div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-[#FFFBF6] text-[#9C5E09] border border-[#FFD08B]">
              Pending verification
            </span>
          </div>
          <div className="border-t border-[#E0E0E0]" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#526973] mb-1">Email</div>
              <div className="text-[#283E48]">{director.inviteEmail}</div>
            </div>
            <a
              href="#"
              className="text-[#3866B0] text-sm font-medium"
              onClick={(e) => e.preventDefault()}
            >
              ✎ Edit
            </a>
          </div>
          <div className="border-t border-[#E0E0E0]" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#526973] mb-1">Invited on</div>
              <div className="text-[#283E48]">{new Date().toLocaleDateString("en-AU")}</div>
            </div>
            <a
              href="#"
              className="text-[#3866B0] text-sm font-medium"
              onClick={(e) => e.preventDefault()}
            >
              Resend invite
            </a>
          </div>
        </Card>
      </div>

      <Alert className="bg-[#F7FAFF] border-[#9CC0F9]">
        <AlertDescription className="text-[#283E48]">
          This is the last screen of the test. Please continue to the comprehension questions when
          ready.
        </AlertDescription>
      </Alert>

      <div className="pt-2">
        <Button onClick={onFinish} disabled={!canFinish} size="lg">
          Continue to questions
        </Button>
      </div>
    </div>
  )
}

function InviteSentToast() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null
  return (
    <div className="absolute top-6 right-6 bg-white border border-[#97EBC8] rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-[357px]">
      <div className="w-6 h-6 rounded-full bg-[#0D7E51] flex-shrink-0 flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#283E48] text-sm">Invite sent!</div>
        <div className="text-sm text-[#526973]">
          The invitation was successfully sent to the email address provided.
        </div>
      </div>
      <button
        className="text-[#526973] hover:text-[#283E48]"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function ContactDashboardBody({
  onContactSupport,
  onFinish,
}: {
  onContactSupport: () => void
  onFinish: () => void
}) {
  const [canFinish, setCanFinish] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setCanFinish(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="max-w-[1088px] space-y-6">
      <div className="text-sm font-medium text-[#526973]">
        Your account is awaiting verification
      </div>

      <Card className="p-6">
        <div className="font-bold text-[#283E48] mb-3">What's next?</div>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <p className="text-[#526973] leading-relaxed max-w-[700px]">
              We have notified our team to get in touch with you regarding your account and its
              permissions. If this request is more urgent and requires immediate addressing contact
              our support team directly.
            </p>
            <Button variant="outline" className="mt-4" onClick={onContactSupport}>
              Contact support
            </Button>
          </div>
        </div>
      </Card>

      <Alert className="bg-[#F7FAFF] border-[#9CC0F9]">
        <AlertDescription className="text-[#283E48]">
          This is the last screen of the test. Please continue to the comprehension questions when
          ready.
        </AlertDescription>
      </Alert>

      <div className="pt-2">
        <Button onClick={onFinish} disabled={!canFinish} size="lg">
          Continue to questions
        </Button>
      </div>
    </div>
  )
}

function ContactSupportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[602px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#283E48]">Contact us</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-[#E0E0E0] p-4">
            <div className="font-bold text-[#283E48] mb-1">Message us</div>
            <p className="text-sm text-[#526973]">
              The best way to reach our team is by messaging us. Tap the chat bubble in the bottom
              right of your screen to start a chat.
            </p>
          </div>
          <div className="rounded-lg border border-[#E0E0E0] p-4">
            <div className="font-bold text-[#283E48]">Email</div>
          </div>
          <div className="rounded-lg border border-[#E0E0E0] p-4">
            <div className="font-bold text-[#283E48]">Phone</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
