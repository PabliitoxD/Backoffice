"use client";

import { useState } from "react";
import "./register.css";

// Form steps
const STEPS = [
  "Personal Info",
  "Company Details",
  "Preferences",
  "Plan Selection",
  "Review",
];

export default function RegisterWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: "",
    email: "",
    phone: "",
    // Step 2: Company Details
    companyName: "",
    companySize: "",
    role: "",
    // Step 3: Preferences
    modules: [],
    notifications: true,
    // Step 4: Plan Selection
    plan: "standard", // basic, standard, premium
  });

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === "modules") {
        const currentModules = [...formData.modules];
        if (checked) {
          currentModules.push(value as never);
        } else {
          const index = currentModules.indexOf(value as never);
          if (index > -1) currentModules.splice(index, 1);
        }
        setFormData({ ...formData, modules: currentModules });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    // TODO: Send data to NestJS API
    alert("Registration completed successfully! Welcome aboard.");
  };

  return (
    <div className="wizard-container">
      <div className="wizard-card">
        <div className="wizard-header">
          <h2>Client Registration</h2>
          <p>Join our platform in just 5 easy steps.</p>
        </div>

        {/* Progress Display */}
        <div className="wizard-progress">
          {STEPS.map((stepName, index) => (
            <div 
              key={index} 
              className={`progress-step ${currentStep === index + 1 ? 'active' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}
            >
              <div className="step-circle">{currentStep > index + 1 ? '✓' : index + 1}</div>
              <span className="step-label">{stepName}</span>
            </div>
          ))}
          <div className="progress-line">
             <div className="progress-line-fill" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="wizard-form">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="form-step fade-in">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {currentStep === 2 && (
            <div className="form-step fade-in">
              <h3>Company Details</h3>
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Acme Corp"
                />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <select name="companySize" value={formData.companySize} onChange={handleChange}>
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
              <div className="form-group">
                <label>Your Role/Title</label>
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  placeholder="e.g. CEO, Manager"
                />
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="form-step fade-in">
              <h3>Preferences</h3>
              <p className="form-hint">Which modules are you interested in?</p>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="modules" 
                    value="analytics" 
                    checked={formData.modules.includes("analytics" as never)}
                    onChange={handleChange}
                  />
                  <span>Analytics Dashboard</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="modules" 
                    value="crm" 
                    checked={formData.modules.includes("crm" as never)}
                    onChange={handleChange}
                  />
                  <span>CRM / Customers</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="modules" 
                    value="finance" 
                    checked={formData.modules.includes("finance" as never)}
                    onChange={handleChange}
                  />
                  <span>Finance & Billing</span>
                </label>
              </div>

              <div className="toggle-switch-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="notifications" 
                    checked={formData.notifications}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">Receive Product Updates</span>
              </div>
            </div>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <div className="form-step fade-in">
              <h3>Plan Selection</h3>
              <div className="plans-grid">
                
                <div className={`plan-card ${formData.plan === 'basic' ? 'selected' : ''}`} onClick={() => setFormData({...formData, plan: 'basic'})}>
                  <h4>Basic</h4>
                  <div className="price">$29<span>/mo</span></div>
                  <ul>
                    <li>Up to 5 users</li>
                    <li>Basic Analytics</li>
                    <li>Email Support</li>
                  </ul>
                </div>

                <div className={`plan-card featured ${formData.plan === 'standard' ? 'selected' : ''}`} onClick={() => setFormData({...formData, plan: 'standard'})}>
                  <div className="badge">Most Popular</div>
                  <h4>Standard</h4>
                  <div className="price">$79<span>/mo</span></div>
                  <ul>
                    <li>Up to 20 users</li>
                    <li>Advanced Analytics</li>
                    <li>Priority Support</li>
                    <li>CRM Module</li>
                  </ul>
                </div>

                <div className={`plan-card ${formData.plan === 'premium' ? 'selected' : ''}`} onClick={() => setFormData({...formData, plan: 'premium'})}>
                  <h4>Premium</h4>
                  <div className="price">$199<span>/mo</span></div>
                  <ul>
                    <li>Unlimited users</li>
                    <li>All Modules included</li>
                    <li>24/7 Phone Support</li>
                    <li>Custom Integrations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="form-step fade-in">
              <h3>Review Details</h3>
              <div className="review-box">
                <div className="review-section">
                  <h4>Profile</h4>
                  <p><strong>Name:</strong> {formData.fullName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                </div>
                <div className="review-section">
                  <h4>Company</h4>
                  <p><strong>Name:</strong> {formData.companyName}</p>
                  <p><strong>Size:</strong> {formData.companySize}</p>
                </div>
                <div className="review-section">
                  <h4>Plan Details</h4>
                  <p className="highlight-plan">{formData.plan.toUpperCase()} Plan</p>
                  <p><strong>Modules:</strong> {formData.modules.length > 0 ? formData.modules.join(", ") : "None specific"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="wizard-actions">
            {currentStep > 1 ? (
              <button type="button" className="btn-secondary" onClick={handlePrev}>
                Back
              </button>
            ) : (
               <div /> /* Spacer */ 
            )}
            
            {currentStep < 5 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button type="submit" className="btn-success">
                Complete Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
