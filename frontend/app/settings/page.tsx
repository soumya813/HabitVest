"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  Database,
  Trash2,
  Download,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, refreshUser, isLoading } = useAuth()
  const { toast } = useToast()

  const initial = useMemo(() => ({
    habitReminders: user?.notifications?.habitReminders ?? true,
    achievementAlerts: user?.notifications?.achievementAlerts ?? true,
    weeklySummary: user?.notifications?.weeklySummary ?? true,
  }), [user])

  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState(initial)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    setNotif(initial)
  }, [initial])

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
    setPushSupported(supported)
    if (!supported) return
    // Check existing subscription
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setPushEnabled(!!sub))
      .catch(() => setPushEnabled(false))
  }, [])

  const saveNotifications = async (next: Partial<typeof notif>) => {
    if (!user?._id) return
    const newState = { ...notif, ...next }
    setNotif(newState)
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:5001/api/v1/users/${user._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: newState }),
      })
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await res.json() : null
      if (!res.ok || !data?.success) throw new Error(data?.msg || 'Failed to save')
      await refreshUser()
      toast({ title: 'Saved', description: 'Notification preferences updated.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Could not save settings', variant: 'destructive' as any })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = () => {
    // Implement data export functionality
    console.log("Exporting user data...")
  }

  const handleDeleteAccount = () => {
    // Implement account deletion with confirmation
    console.log("Delete account requested...")
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const enablePush = async () => {
    try {
      if (!pushSupported) throw new Error('Push not supported in this browser')
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Notifications permission was denied')
      // Get public key
      const keyRes = await fetch('http://localhost:5001/api/v1/push/public-key')
      const { key } = await keyRes.json()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key)
      })
      // Send to backend
      await fetch('http://localhost:5001/api/v1/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })
      setPushEnabled(true)
      toast({ title: 'Push enabled', description: 'Browser push notifications are on.' })
    } catch (e: any) {
      toast({ title: 'Push failed', description: e?.message || 'Could not enable push', variant: 'destructive' as any })
    }
  }

  const disablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('http://localhost:5001/api/v1/push/unsubscribe', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        })
        await sub.unsubscribe()
      }
      setPushEnabled(false)
      toast({ title: 'Push disabled', description: 'Browser push notifications are off.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Could not disable push', variant: 'destructive' as any })
    }
  }

  const sendTestPush = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/v1/push/test', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!data?.success) throw new Error(data?.msg || 'Failed to send test')
      toast({ title: 'Test sent', description: 'Check your device for a push notification.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to send test notification', variant: 'destructive' as any })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pushSupported ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifs">Browser Push</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications even when the app is closed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="push-notifs"
                      checked={pushEnabled}
                      disabled={isLoading}
                      onCheckedChange={(v) => v ? enablePush() : disablePush()}
                    />
                    {pushEnabled && (
                      <Button size="sm" variant="outline" onClick={sendTestPush}>Test</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your browser does not support push notifications.
                </div>
              )}
              
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="habit-reminders">Habit Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when it's time to complete your habits
                  </p>
                </div>
                <Switch
                  id="habit-reminders"
                  checked={notif.habitReminders}
                  disabled={saving || isLoading}
                  onCheckedChange={(v) => saveNotifications({ habitReminders: Boolean(v) })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Celebrate when you reach milestones and level up
                  </p>
                </div>
                <Switch
                  id="achievement-alerts"
                  checked={notif.achievementAlerts}
                  disabled={saving || isLoading}
                  onCheckedChange={(v) => saveNotifications({ achievementAlerts: Boolean(v) })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary">Weekly Summary</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive a weekly report of your progress
                  </p>
                </div>
                <Switch
                  id="weekly-summary"
                  checked={notif.weeklySummary}
                  disabled={saving || isLoading}
                  onCheckedChange={(v) => saveNotifications({ weeklySummary: Boolean(v) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch id="dark-mode" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Show more content in less space
                  </p>
                </div>
                <Switch id="compact-mode" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow anonymous usage analytics to improve the app
                  </p>
                </div>
                <Switch id="data-sharing" />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Make your habit progress visible to other users
                  </p>
                </div>
                <Switch id="public-profile" />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download all your habit data and progress
                  </p>
                </div>
                <Button 
                  onClick={handleExportData}
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-red-600">Delete Account</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="destructive" 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
