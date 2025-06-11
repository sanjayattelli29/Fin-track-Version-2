
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Percent } from "lucide-react";

interface ProfileData {
  name: string;
  phone: string;
  imageUrl: string;
  currency: string;
  showAllAccountsAnalysis: boolean;
  showDebtFeature?: boolean;
  debtPrincipal?: number;
  debtInterestRate?: number;
}

interface FeaturesSectionProps {
  profile: ProfileData;
  debtPrincipal: string;
  debtInterestRate: string;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  setDebtPrincipal: React.Dispatch<React.SetStateAction<string>>;
  setDebtInterestRate: React.Dispatch<React.SetStateAction<string>>;
  onToggleDebtFeature: (enabled: boolean) => Promise<void>;
  onSaveChanges: () => Promise<void>;
  onClearDebtFields: () => Promise<void>;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  profile,
  debtPrincipal,
  debtInterestRate,
  setProfile,
  setDebtPrincipal,
  setDebtInterestRate,
  onToggleDebtFeature,
  onSaveChanges,
  onClearDebtFields,
}) => {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Features</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Debt Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Enable debt and interest tracking
            </p>
          </div>
          <Switch
            checked={profile.showDebtFeature || false}
            onCheckedChange={onToggleDebtFeature}
          />
        </div>

        {profile.showDebtFeature && (
          <div className="bg-muted/30 rounded-lg p-4 mt-2">
            <div className="mb-3">
              <Label htmlFor="debtPrincipal">Debt Principal</Label>
              <div className="flex mt-1">
                <Input
                  id="debtPrincipal"
                  type="number"
                  value={debtPrincipal}
                  onChange={(e) => setDebtPrincipal(e.target.value)}
                  placeholder="0.00"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="mb-3">
              <Label htmlFor="debtInterestRate">Interest Rate (%)</Label>
              <div className="flex mt-1">
                <Input
                  id="debtInterestRate"
                  type="number"
                  value={debtInterestRate}
                  onChange={(e) => setDebtInterestRate(e.target.value)}
                  placeholder="0.00"
                  className="flex-1"
                />
                <div className="flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md bg-muted">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button onClick={onSaveChanges} variant="default" className="flex-1">
                Save Changes
              </Button>
              <Button onClick={onClearDebtFields} variant="outline" className="flex-1">
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-medium">All Accounts Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Show combined analysis for all accounts
            </p>
          </div>
          <Switch
            checked={profile.showAllAccountsAnalysis}
            onCheckedChange={(checked) => {
              setProfile({ ...profile, showAllAccountsAnalysis: checked });
              onSaveChanges();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
