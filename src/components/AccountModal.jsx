import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  VStack,
  useToast,
  Avatar,
  Box,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useApp } from '../context/AppContext'

const AccountModal = ({ isOpen, onClose, account = null }) => {
  const { addAccount, updateAccount } = useApp()
  const toast = useToast()
  const isEdit = !!account
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    jobTitle: '',
    department: '',
    userType: '',
    profilePicture: null,
  })
  const [profilePreview, setProfilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          name: account.name || '',
          username: account.username || '',
          password: '', // Don't show existing password for security
          jobTitle: account.jobTitle || '',
          department: account.department || '',
          userType: account.userType || '',
          profilePicture: null,
        })
        setProfilePreview(account.profilePicture || null)
      } else {
        setFormData({
          name: '',
          username: '',
          password: '',
          jobTitle: '',
          department: '',
          userType: '',
          profilePicture: null,
        })
        setProfilePreview(null)
      }
      setShowPassword(false)
    }
  }, [account, isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setFormData(prev => ({ ...prev, profilePicture: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.userType) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // For new accounts, username and password are required
    if (!isEdit && (!formData.username || !formData.password)) {
      toast({
        title: 'Validation Error',
        description: 'Username and password are required for new accounts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    
    // Handle profile picture
    let profilePictureUrl = profilePreview
    if (formData.profilePicture) {
      // If a new file was uploaded, create a blob URL
      if (formData.profilePicture instanceof File) {
        profilePictureUrl = URL.createObjectURL(formData.profilePicture)
      }
    }

    const accountData = {
      name: formData.name,
      username: formData.username,
      jobTitle: formData.jobTitle,
      department: formData.department,
      userType: formData.userType,
      profilePicture: profilePictureUrl,
    }

    // Only include password if it's provided (for new accounts or password updates)
    if (formData.password) {
      accountData.password = formData.password
    }

    if (isEdit) {
      updateAccount(account.id, accountData)
      toast({
        title: 'Account Updated',
        description: 'Account has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      addAccount(accountData)
      toast({
        title: 'Account Created',
        description: 'Account has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }

    setFormData({
      name: '',
      username: '',
      password: '',
      jobTitle: '',
      department: '',
      userType: '',
      profilePicture: null,
    })
    setProfilePreview(null)
    setShowPassword(false)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{isEdit ? 'Edit Account' : 'Create New Account'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* Profile Picture Upload */}
              <FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <VStack spacing={4}>
                  <Avatar
                    src={profilePreview}
                    name={formData.name || 'User'}
                    size="xl"
                  />
                  <Box>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      display="none"
                      id="profile-picture-upload"
                    />
                    <Button
                      as="label"
                      htmlFor="profile-picture-upload"
                      cursor="pointer"
                      variant="outline"
                      size="sm"
                    >
                      {profilePreview ? 'Change Picture' : 'Upload Picture'}
                    </Button>
                  </Box>
                  <Text fontSize="xs" color="gray.500">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </Text>
                </VStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </FormControl>

              <FormControl isRequired={!isEdit}>
                <FormLabel>Username</FormLabel>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  isDisabled={isEdit} // Username shouldn't be changed after creation
                />
                {isEdit && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Username cannot be changed after account creation
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired={!isEdit}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                {isEdit && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Leave blank to keep current password
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Job Title</FormLabel>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Enter job title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Department</FormLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Select department"
                >
                  <option value="Administration">Administration</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="IT">IT</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>User Type</FormLabel>
                <Select
                  value={formData.userType}
                  onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                  placeholder="Select user type"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="User">User</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Update' : 'Create'} Account
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default AccountModal




