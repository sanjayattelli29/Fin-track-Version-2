
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  name: string;
  imageUrl: string;
  showDebtFeature: boolean;
  showAllAccountsAnalysis: boolean;
}

export const useUserProfile = () => {
  const [username, setUsername] = useState("Sanjay Kumar");
  const [profileImage, setProfileImage] = useState("");
  const [showAllAccountsAnalysis, setShowAllAccountsAnalysis] = useState(false);
  const [showDebtFeature, setShowDebtFeature] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error("Error fetching user profile from Supabase:", error);
          return;
        }
        
        if (data) {
          if (data.name) setUsername(data.name);
          if (data.image_url) setProfileImage(data.image_url);
          if (data.show_all_accounts_analysis !== undefined) {
            setShowAllAccountsAnalysis(data.show_all_accounts_analysis);
          }
          if (data.show_debt_feature !== undefined) {
            setShowDebtFeature(data.show_debt_feature);
          }
        } else {
          // Create default profile if none exists
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              name: 'Sanjay Kumar',
              phone: '+91 8977300290',
              image_url: 'https://designwithsanjay.site/static/media/HeroImage.96b29a6adf82c5484',
              currency: 'INR (₹)',
              show_all_accounts_analysis: false,
              show_debt_feature: false
            }])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating default profile:", createError);
          } else if (newProfile) {
            setUsername(newProfile.name);
            setProfileImage(newProfile.image_url || "");
            setShowAllAccountsAnalysis(newProfile.show_all_accounts_analysis || false);
            setShowDebtFeature(newProfile.show_debt_feature || false);
          }
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Save user profile to Supabase
  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    try {
      let profileId;
      
      // Get the profile ID
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching profile ID:", fetchError);
        return;
      }
      
      const updateData = {
        name: profile.name !== undefined ? profile.name : username,
        image_url: profile.imageUrl !== undefined ? profile.imageUrl : profileImage,
        show_all_accounts_analysis: profile.showAllAccountsAnalysis !== undefined ? profile.showAllAccountsAnalysis : showAllAccountsAnalysis,
        show_debt_feature: profile.showDebtFeature !== undefined ? profile.showDebtFeature : showDebtFeature
      };
      
      if (existingProfile) {
        // Update existing profile
        profileId = existingProfile.id;
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profileId);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
          return;
        }
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            ...updateData,
            phone: '+91 8977300290',
            currency: 'INR (₹)'
          }])
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating profile:", createError);
          return;
        }
        
        profileId = newProfile.id;
      }
      
      // Update local state
      if (profile.name !== undefined) setUsername(profile.name);
      if (profile.imageUrl !== undefined) setProfileImage(profile.imageUrl);
      if (profile.showAllAccountsAnalysis !== undefined) {
        setShowAllAccountsAnalysis(profile.showAllAccountsAnalysis);
      }
      if (profile.showDebtFeature !== undefined) {
        setShowDebtFeature(profile.showDebtFeature);
      }
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
    }
  };
  
  return {
    username,
    profileImage,
    showAllAccountsAnalysis,
    showDebtFeature,
    isLoading,
    setShowAllAccountsAnalysis: (value: boolean) => 
      updateUserProfile({ showAllAccountsAnalysis: value }),
    setShowDebtFeature: (value: boolean) => 
      updateUserProfile({ showDebtFeature: value }),
    updateUserProfile
  };
};
