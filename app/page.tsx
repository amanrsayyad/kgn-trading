"use client";

import { useAppSelector } from "@/lib/hooks";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Wallet, Activity, DollarSign } from "lucide-react";

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: "Total Balance",
      value: "$24,500.00",
      description: "+12.5% from last month",
      icon: DollarSign,
    },
    {
      title: "Active Trades",
      value: "12",
      description: "3 pending executions",
      icon: Activity,
    },
    {
      title: "Portfolio Value",
      value: "$89,432.00",
      description: "+8.2% this week",
      icon: Wallet,
    },
    {
      title: "Today's Profit",
      value: "+$2,345.67",
      description: "+5.4% increase",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "Trader"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your trades today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest trades and transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">BTC/USD Long</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+$234.50</p>
                    <p className="text-sm text-muted-foreground">+2.3%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">ETH/USD Short</p>
                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-$89.20</p>
                    <p className="text-sm text-muted-foreground">-1.2%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">XRP/USD Long</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+$567.80</p>
                    <p className="text-sm text-muted-foreground">+4.5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Your trading performance overview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Win Rate</span>
                  <span className="text-sm font-bold">68.5%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: "68.5%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Profit</span>
                  <span className="text-sm font-bold text-green-600">
                    +3.2%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Trades</span>
                  <span className="text-sm font-bold">247</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Day</span>
                  <span className="text-sm font-bold text-green-600">
                    +$1,234.50
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
