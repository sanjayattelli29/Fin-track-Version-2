
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProfileData {
  name: string;
  phone: string;
  imageUrl: string;
  currency: string;
  showAllAccountsAnalysis: boolean;
  showDebtFeature?: boolean;
}

interface PersonalInfoSectionProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  onSave: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
  setProfile,
  onSave,
}) => {
  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <img
            src={profile.imageUrl || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-primary"
          />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="profileImageUrl">Profile Image URL</Label>
        <Input
          id="profileImageUrl"
          value={profile.imageUrl}
          onChange={(e) => setProfile({ ...profile, imageUrl: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="currency">Preferred Currency</Label>
        <select
          id="currency"
          value={profile.currency}
          onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
        >
          <option value="INR (₹)">INR (₹)</option>
          <option value="USD ($)">USD ($)</option>
          <option value="EUR (€)">EUR (€)</option>
          <option value="GBP (£)">GBP (£)</option>
        </select>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Label htmlFor="all-accounts-analysis">All Accounts Analysis</Label>
          <p className="text-sm text-muted-foreground">
            View combined analysis of all sub-accounts
          </p>
        </div>
        <Switch
          id="all-accounts-analysis"
          checked={profile.showAllAccountsAnalysis}
          onCheckedChange={(checked) =>
            setProfile({ ...profile, showAllAccountsAnalysis: checked })
          }
        />
      </div>

      <Button onClick={onSave} className="w-full">
        Save Profile
      </Button>
    </div>
  );
};

export default PersonalInfoSection;
