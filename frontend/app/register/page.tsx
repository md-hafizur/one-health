"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Phone, MapPin, Upload, FileImage, PenTool, CreditCard, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Form, 2: Verification, 3: Payment, 4: Success
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    first_name_en: '',
    last_name_en: '',
    name_bn: '',
    contactMethod: 'phone', // 'phone' or 'email'
    contactValue: '',
    nid: '',
    father_name_en: '',
    father_name_bn: '',
    mother_name_en: '',
    mother_name_bn: '',
    spouse_name_en: '',
    spouse_name_bn: '',
    occupation: '',
    blood_group: '',
    data_of_birth: '',
    division: '',
    zilla: '',
    upazila: '',
    union: '',
    postOffice: '',
    village: '',
    para: '',
    serviceCode: '',
    photo: null as File | null,
    signature: null as File | null,
  })

  useEffect(() => {
    // Generate serviceCode only on the client side
    setFormData((prevData) => ({
      ...prevData,
      serviceCode: `SVC-${Date.now()}`,
    }))
  }, [])

  const router = useRouter()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      toast.success("Photo uploaded successfully")
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, signature: file })
      toast.success("Signature uploaded successfully")
    }
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const { contactMethod, contactValue, first_name_en, last_name_en } = formData;

  if (!contactValue) {
    toast.error(`Please provide a ${contactMethod === "phone" ? "phone number" : "email address"}`);
    return;
  }

  console.log("Current formData state:", formData); // Debugging: Check formData before submission

const firstName = first_name_en;
const lastName = last_name_en;

  const buildAddressPayload = () => ({
    division: +formData.division,
    zilla: +formData.zilla,
    upazila: +formData.upazila,
    union: +formData.union,
    post_office: +formData.postOffice,
    village: +formData.village,
    para: +formData.para,
  });

  const buildPostData = () => {
    const data = {
      user_data: {
        first_name: firstName,
        last_name: lastName,
        username: contactValue,
        email: contactMethod === 'email' ? contactValue : undefined,
        phone: contactMethod === 'phone' ? contactValue : undefined,
      },
      user_profile: {
        name_en: `${formData.first_name_en} ${formData.last_name_en}`,
        name_bn: formData.name_bn,
        phone: contactMethod === 'phone' ? contactValue : '',
        gurdian_phone: '',
        nid: formData.nid,
        gurdian_nid: '',
        father_name_en: formData.father_name_en,
        father_name_bn: formData.father_name_bn,
        mother_name_en: formData.mother_name_en,
        mother_name_bn: formData.mother_name_bn,
        spouse_name_en: formData.spouse_name_en,
        spouse_name_bn: formData.spouse_name_bn,
        occupation: formData.occupation,
        blood_group: formData.blood_group,
        data_of_birth: formData.data_of_birth,
        email: contactMethod === 'email' ? contactValue : '',
        address: buildAddressPayload(),
      },
    };

    const form = new FormData();
    form.append('user_data', JSON.stringify(data.user_data));

    // Create a copy of user_profile data without photo and signature for JSON stringify
    const userProfileJsonData = {
      ...data.user_profile,
      photo: undefined, // Exclude photo from JSON
      signature: undefined, // Exclude signature from JSON
    };
    form.append('user_profile', JSON.stringify(userProfileJsonData));

    if (formData.photo) {
      form.append('user_profile.photo', formData.photo);
    }
    if (formData.signature) {
      form.append('user_profile.signature', formData.signature);
    }

    console.log("FormData object contents:"); // Debugging: Inspect FormData
    for (let pair of form.entries()) {
      console.log(pair[0]+ ', ' + pair[1]);
    }

    return form;
  };

  try {
    const response = await fetch(`${apiUrl}/accounts/register?identity=DataCollector&for_account=public`, {
      method: 'POST',
      body: buildPostData(),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (response.ok) {
      const registrationData = {
        ...formData,
        ...responseData,
        registrationId: `REG-${Date.now().toString().slice(-6)}`,
        verificationType: contactMethod,
        contactValue,
      };
      localStorage.setItem("pendingUserRegistration", JSON.stringify(registrationData));
      setSubmittedData(registrationData);
      setStep(2);
      toast.success("Registration data submitted! Please verify your contact information.");
    } else {
      toast.error(`Registration failed: ${responseData?.detail || JSON.stringify(responseData)}`);
    }
  } catch (error) {
    toast.error("An error occurred while submitting the form.");
  }
};


  const handleVerificationComplete = () => {
    setStep(3)
    toast.success("Verification complete! Please proceed with payment.")
  }

  const handlePaymentSuccess = () => {
    setStep(4)
    toast.success("Payment successful! Digital card will be issued.")
  }


  const [divisions, setDivisions] = useState([]);
  const [zillas, setZillas] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [postOffices, setPostOffices] = useState([]);
  const [villages, setVillages] = useState([]);
  const [paras, setParas] = useState([]);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const addressurl = apiUrl+'/address';

  useEffect(() => {
    fetch(`${addressurl}/divisions/`)
      .then(res => res.json())
      .then(setDivisions);
  }, []);

  useEffect(() => {
    if (formData.division) {
      fetch(`${addressurl}/zillas/?division=${formData.division}`)
        .then(res => res.json())
        .then(setZillas);
    } else {
      setZillas([]);
    }
    setFormData(prev => ({ ...prev, zilla: '', upazila: '', union: '', village: '', para: '' }));
  }, [formData.division]);

  useEffect(() => {
    if (formData.zilla) {
      fetch(`${addressurl}/upazilas/?zilla=${formData.zilla}`)
        .then(res => res.json())
        .then(setUpazilas);
    } else {
      setUpazilas([]);
    }
    setFormData(prev => ({ ...prev, upazila: '', union: '', village: '', para: '' }));
  }, [formData.zilla]);

  useEffect(() => {
    if (formData.upazila) {
      fetch(`${addressurl}/unions/?upazila=${formData.upazila}`)
        .then(res => res.json())
        .then(setUnions);
    } else {
      setUnions([]);
    }
    setFormData(prev => ({ ...prev, union: '', village: '', para: '' }));
  }, [formData.upazila]);

  useEffect(() => {
    if (formData.union) {
      fetch(`${addressurl}/villages/?union=${formData.union}`)
        .then(res => res.json())
        .then(setVillages);
    } else {
      setVillages([]);
    }
    setFormData(prev => ({ ...prev, village: '', para: '' }));
  }, [formData.union]);

    useEffect(() => {
    if (formData.union) {
      fetch(`${addressurl}/postoffices/?union=${formData.union}`)
        .then(res => res.json())
        .then(setPostOffices);
    } else {
      setPostOffices([]);
    }
    setFormData(prev => ({ ...prev, postOffice: '', village: '', para: '' }));
  }, [formData.union]);


  useEffect(() => {
    if (formData.village) {
      fetch(`${addressurl}/paras/?village=${formData.village}`)
        .then(res => res.json())
        .then(setParas);
    } else {
      setParas([]);
    }
    setFormData(prev => ({ ...prev, para: '' }));
  }, [formData.village]);
// Similar for fetchUpazilas, fetchUnions, etc.


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/collector/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Public User Registration</h1>
              <p className="text-gray-600">Complete the form to register a new user</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 1 ? "bg-green-600" : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-green-600" : "text-gray-500"}`}>
                Registration
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 2 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 2 ? (step > 2 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 2 ? "✓" : "2"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 2 ? (step > 2 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Verification
              </span>
            </div>
            <div className={`flex-1 h-px ${step >= 3 ? "bg-green-300" : "bg-gray-300"} mx-4`}></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 ${step >= 3 ? (step > 3 ? "bg-green-600" : "bg-blue-600") : "bg-gray-300"} rounded-full flex items-center justify-center text-white text-sm font-semibold`}
              >
                {step > 3 ? "✓" : "3"}
              </div>
              <span
                className={`text-sm font-medium ${step >= 3 ? (step > 3 ? "text-green-600" : "text-blue-600") : "text-gray-500"}`}
              >
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  User Information
                </CardTitle>
                <CardDescription>Fill in all required information to create a new health card account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <Label htmlFor="first_name_en">First Name (English) *</Label>
                      <Input
                        id="first_name_en"
                        value={formData.first_name_en}
                        onChange={(e) => setFormData({ ...formData, first_name_en: e.target.value })}
                        placeholder="Enter first name in English"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name_en">Last Name (English) *</Label>
                      <Input
                        id="last_name_en"
                        value={formData.last_name_en}
                        onChange={(e) => setFormData({ ...formData, last_name_en: e.target.value })}
                        placeholder="Enter last name in English"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="name_bn">Name (Bangla) *</Label>
                      <Input
                        id="name_bn"
                        value={formData.name_bn}
                        onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                        placeholder="বাংলায় নাম লিখুন"
                        required
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="contactMethod">Contact Method *</Label>
                        <Select
                          value={formData.contactMethod}
                          onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                        >
                          <SelectTrigger id="contactMethod">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="contactValue">Contact Value *</Label>
                        <Input
                          id="contactValue"
                          type={formData.contactMethod === "phone" ? "tel" : "email"}
                          value={formData.contactValue}
                          onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                          placeholder={formData.contactMethod === "phone" ? "Enter phone number" : "Enter email address"}
                          required
                          maxLength={formData.contactMethod === "phone" ? 11 : undefined}
                        />
                      </div>
                    </div>

                    {/* NID Info */}
                    <div>
                      <Label htmlFor="nid">NID</Label>
                      <Input
                        id="nid"
                        value={formData.nid}
                        onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                        placeholder="Enter NID number"
                        maxLength={17}
                      />
                    </div>

                    {/* DOB, Blood Group, Occupation */}
                    <div>
                      <Label htmlFor="data_of_birth">Date of Birth</Label>
                      <Input
                        id="data_of_birth"
                        type="date"
                        value={formData.data_of_birth}
                        onChange={(e) => setFormData({ ...formData, data_of_birth: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="blood_group">Blood Group</Label>
                      <Input
                        id="blood_group"
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        placeholder="e.g. A+, B-, O+"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Enter occupation"
                      />
                    </div>

                    {/* Family Info */}
                    <div>
                      <Label htmlFor="father_name_en">Father's Name (English)</Label>
                      <Input
                        id="father_name_en"
                        value={formData.father_name_en}
                        onChange={(e) => setFormData({ ...formData, father_name_en: e.target.value })}
                        placeholder="Father's name in English"
                      />
                    </div>

                    <div>
                      <Label htmlFor="father_name_bn">Father's Name (Bangla)</Label>
                      <Input
                        id="father_name_bn"
                        value={formData.father_name_bn}
                        onChange={(e) => setFormData({ ...formData, father_name_bn: e.target.value })}
                        placeholder="বাংলায় বাবার নাম"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mother_name_en">Mother's Name (English)</Label>
                      <Input
                        id="mother_name_en"
                        value={formData.mother_name_en}
                        onChange={(e) => setFormData({ ...formData, mother_name_en: e.target.value })}
                        placeholder="Mother's name in English"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mother_name_bn">Mother's Name (Bangla)</Label>
                      <Input
                        id="mother_name_bn"
                        value={formData.mother_name_bn}
                        onChange={(e) => setFormData({ ...formData, mother_name_bn: e.target.value })}
                        placeholder="বাংলায় মায়ের নাম"
                      />
                    </div>

                    <div>
                      <Label htmlFor="spouse_name_en">Spouse Name (English)</Label>
                      <Input
                        id="spouse_name_en"
                        value={formData.spouse_name_en}
                        onChange={(e) => setFormData({ ...formData, spouse_name_en: e.target.value })}
                        placeholder="Spouse name in English"
                      />
                    </div>

                    <div>
                      <Label htmlFor="spouse_name_bn">Spouse Name (Bangla)</Label>
                      <Input
                        id="spouse_name_bn"
                        value={formData.spouse_name_bn}
                        onChange={(e) => setFormData({ ...formData, spouse_name_bn: e.target.value })}
                        placeholder="বাংলায় স্ত্রীর নাম"
                      />
                    </div>

                    </div>


                  {/* Address Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Division */}
                  <div>
                    <Label htmlFor="division">Division *</Label>
                    <Select
                      value={formData.division}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, division: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zilla */}
                  <div>
                    <Label htmlFor="zilla">District *</Label>
                    <Select
                      value={formData.zilla}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, zilla: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {zillas.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upazila */}
                  <div>
                    <Label htmlFor="upazila">Upazila *</Label>
                    <Select
                      value={formData.upazila}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, upazila: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select upazila" />
                      </SelectTrigger>
                      <SelectContent>
                        {upazilas.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Union */}
                  <div>
                    <Label htmlFor="union">Union *</Label>
                    <Select
                      value={formData.union}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, union: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select union" />
                      </SelectTrigger>
                      <SelectContent>
                        {unions.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Post Office */}
                  <div>
                    <Label htmlFor="postOffice">Post Office *</Label>
                    <Select
                      value={formData.postOffice}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, postOffice: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select post office" />
                      </SelectTrigger>
                      <SelectContent>
                        {postOffices.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en} ({item.postal_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="village">Village *</Label>
                    <Select
                      value={formData.village}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, village: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Para */}
                  <div>
                    <Label htmlFor="para">Para *</Label>
                    <Select
                      value={formData.para}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, para: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select para" />
                      </SelectTrigger>
                      <SelectContent>
                        {paras.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                  {/* File Uploads */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="photo">Public User Photo *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileImage className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {formData.photo ? formData.photo.name : "Click to upload photo"}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                          </div>
                          <input
                            id="photo"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            required
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signature">Public User Signature *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="signature"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PenTool className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {formData.signature ? formData.signature.name : "Click to upload signature"}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 1MB)</p>
                          </div>
                          <input
                            id="signature"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-5 w-5 mr-2" />
                      Continue to Verification
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Verification */}
        {step === 2 && submittedData && (
          <UserVerificationStep onVerificationComplete={handleVerificationComplete} registrationData={submittedData} />
        )}

        {/* Step 3: Payment */}
        {step === 3 && submittedData && <UserPaymentStep onPaymentSuccess={handlePaymentSuccess} registrationData={submittedData} />}

        {/* Step 4: Success */}
        {step === 4 && submittedData && <UserSuccessStep registrationData={submittedData} onRegisterAnotherUser={() => { setStep(1); setSubmittedData(null); }} />}
      </div>
    </div>
  )
}

// Verification Step Component
function UserVerificationStep({ onVerificationComplete, registrationData }: any) {
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const isPhoneVerification = registrationData.verificationType === "phone"
  const contactInfo = registrationData.contactValue
  const ContactIcon = isPhoneVerification ? Phone : Mail
  const verificationMethod = isPhoneVerification ? "Phone Number" : "Email Address"
  

  const handleSendOtp = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    console.log("registerationData-------------->", registrationData);
    if (!registrationData?.application_id) {
      toast.error("User ID not found. Cannot send OTP.");
      return;
    }

    const payload = {
      user_id: registrationData.application_id,
      contact: registrationData.contactValue,
      contact_type: registrationData.verificationType,
    };

    try {
      const response = await fetch(`${apiUrl}/accounts/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOtpSent(true);
        setResendCooldown(60);
        toast.success(`OTP sent to ${contactInfo}`);

        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send OTP: ${errorData.detail || 'An unknown error occurred'}`);
      }
    } catch (error) {
      toast.error('An error occurred while sending the OTP.');
      console.error('Send OTP error:', error);
    }
  };

  const handleVerifyOtp = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!registrationData?.application_id) {
      toast.error("User ID not found. Cannot verify OTP.");
      return;
    }

    const payload = {
      user_id: registrationData.application_id,
      otp: otp,
    };

    try {
      const response = await fetch(`${apiUrl}/accounts/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setVerified(true);
        toast.success(`${verificationMethod} verified successfully!`);
      } else {
        toast.error(`OTP verification failed: ${responseData?.detail || JSON.stringify(responseData)}`);
      }
    } catch (error) {
      toast.error('An error occurred while verifying the OTP.');
      console.error('Verify OTP error:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ContactIcon className="h-6 w-6 text-blue-600" />
            Verify {verificationMethod}
          </CardTitle>
          <CardDescription>
            We need to verify your {verificationMethod.toLowerCase()} to ensure account security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verified && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Application Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {registrationData.first_name_en} {registrationData.last_name_en}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{registrationData.contactValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Type:</span>
                    <span className="font-medium capitalize">{registrationData.verificationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-mono font-medium">{registrationData.application_id}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center">
              <div
                className={`w-16 h-16 ${isPhoneVerification ? "bg-blue-100" : "bg-green-100"} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <ContactIcon className={`h-8 w-8 ${isPhoneVerification ? "text-blue-600" : "text-green-600"}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify {verificationMethod}</h3>
              {!verified && (
                <p className="text-gray-600 mb-4">
                  We'll send a 6-digit OTP to <strong>{contactInfo}</strong>
                </p>
              )}
            </div>

            {!otpSent ? (
              <Button onClick={handleSendOtp} className="w-full bg-blue-600 hover:bg-blue-700">
                <ContactIcon className="h-4 w-4 mr-2" />
                Send OTP to {verificationMethod}
              </Button>
            ) : (
              <div className="space-y-4">
                {!verified && (
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-mono"
                      disabled={verified}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  {!verified && (
                    <Button onClick={handleSendOtp} variant="outline" disabled={resendCooldown > 0} className="flex-1">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </Button>
                  )}
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || verified}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {verified ? "Verified" : "Verify OTP"}
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              {verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">{verificationMethod} verified successfully!</p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">You can now proceed to the payment step.</p>
                </div>
              )}
              <Button
                onClick={onVerificationComplete}
                disabled={!verified}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Payment Step Component
function UserPaymentStep({ onPaymentSuccess, registrationData, verified }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Payment
          </CardTitle>
          <CardDescription>Complete payment to activate the health card</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verified && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Application Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {registrationData.first_name_en} {registrationData.last_name_en}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{registrationData.contactValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Type:</span>
                    <span className="font-medium capitalize">{registrationData.verificationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-mono font-medium">{registrationData.application_id}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-600">Amount to Pay</p>
              <p className="text-3xl font-bold text-gray-800">৳500</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Registration Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>{registrationData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span>{registrationData.contactValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Code:</span>
                  <span>{registrationData.serviceCode}</span>
                </div>
              </div>
            </div>

            <Button onClick={onPaymentSuccess} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ৳500 Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Success Step Component
function UserSuccessStep({ registrationData, onRegisterAnotherUser }: any) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [id, setId] = useState("")

  useEffect(() => {
    setUsername(`user${Date.now().toString().slice(-4)}`)
    setPassword(`temp${Math.floor(Math.random() * 1000)}`)
    setId(`OH-2024-${Date.now().toString().slice(-3)}`)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            The user has been registered successfully. Login credentials have been sent via{" "}
            {registrationData.verificationType === "phone" ? "SMS" : "email"}.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Login Credentials Sent:</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Password:</strong> {password}
              </p>
              <p>
                <strong>ID:</strong> {id}
              </p>
              <p>
                <strong>Sent to:</strong> {registrationData.contactValue}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/collector/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={onRegisterAnotherUser} className="flex-1 bg-blue-600 hover:bg-blue-700">Register Another User</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
