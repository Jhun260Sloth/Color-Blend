<script setup lang="ts">
interface ColorEntry {
  hex: string
  name: string
}

const colorData = ref<ColorEntry[]>([])
const selectedColors = ref<ColorEntry[]>([])
const blendedColor = ref('')
const isLoading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 12
const showHex = ref<string | null>(null)
const toast = useToast()


const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const blendColors = () => {
  if (selectedColors.value.length < 2) return

  const rgbColors = selectedColors.value.map(color => hexToRgb(color.hex))
  const validColors = rgbColors.filter(color => color !== null)

  if (validColors.length < 2) return

  const blended = {
    r: Math.round(validColors.reduce((sum, color) => sum + color!.r, 0) / validColors.length),
    g: Math.round(validColors.reduce((sum, color) => sum + color!.g, 0) / validColors.length),
    b: Math.round(validColors.reduce((sum, color) => sum + color!.b, 0) / validColors.length)
  }

  blendedColor.value = rgbToHex(blended.r, blended.g, blended.b)
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const toggleColor = (color: ColorEntry) => {
  const index = selectedColors.value.findIndex(c => c.hex === color.hex)
  if (index === -1) {
    if (selectedColors.value.length < 10) {
      selectedColors.value.push(color)
    }
  } else {
    selectedColors.value.splice(index, 1)
  }
  blendColors()
}

const totalPages = computed(() => Math.ceil(colorData.value.length / itemsPerPage))
const paginatedColors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return colorData.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/api/colors')
    if (!response.ok) {
      throw new Error('Failed to fetch colors')
    }
    
    const data = await response.json()
    colorData.value = data.map((item: any) => ({
      hex: item.hex,
      name: item.name
    }))
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>

    <div class="min-h-screen bg-gray-50 p-6">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm rounded-xl mb-6 px-6 py-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-800">Color/Blend</h1>
          <div class="flex items-center space-x-4">
          </div>
        </div>
      </div>
    </nav>


    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center p-4 bg-red-50 rounded-lg">
      {{ error }}
    </div>
    <div v-else class="max-w-7xl mx-auto">
      <!-- Color Palette and Blend Section -->
      <div class="mb-12 bg-white rounded-xl shadow-sm p-6">
      
        
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Selected Colors Column -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Selected Colors</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div v-for="color in selectedColors" 
                  :key="color.hex" 
                  class="group relative">
                <div class="h-24 w-full rounded-lg shadow-md transition-transform hover:scale-105"
                    :style="{ backgroundColor: color.hex }">
                  <button 
                    @click="toggleColor(color)"
                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="text-xl">×</span>
                  </button>

                </div>
                <div class="mt-2">
                  <p class="font-medium text-gray-800">{{ color.name }}</p>
                  <p class="text-sm font-mono text-gray-500">{{ color.hex }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Blended Result Column -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Blended Result</h3>
            <div v-if="blendedColor && selectedColors.length >= 2">
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <div class="h-32 w-32 rounded-lg shadow-lg transition-transform hover:scale-105" 
                     :style="{ backgroundColor: blendedColor }">
                </div>
                <div class="text-center sm:text-left">
                  <p class="font-mono text-lg text-gray-700">{{ blendedColor }}</p>
                  <button @click="copyToClipboard(blendedColor)" 
                          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Copy HEX
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-32 text-gray-500">
              Select at least 2 colors to see blend result
            </div>
          </div>
        </div>
      </div>

      <!-- Color Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="color in paginatedColors" 
             :key="color.hex" 
             class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
             :class="{'ring-2 ring-blue-500': selectedColors.some(c => c.hex === color.hex)}">
          <div class="relative h-48 w-full" 
               @mouseenter="showHex = color.hex"
               @mouseleave="showHex = null">
            <div class="absolute inset-0 transition-transform group-hover:scale-105 duration-300"
                 :style="{ backgroundColor: color.hex }">
            </div>
            <div v-if="showHex === color.hex" 
                 class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-mono">
              {{ color.hex }}
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ color.name }}</h3>
            <div class="flex justify-between items-center mt-2">
              <p class="font-mono text-gray-600">{{ color.hex }}</p>
              <div class="flex gap-2">
                <button @click="copyToClipboard(color.hex)" 
                        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700">
                  Copy
                </button>
                <button @click="toggleColor(color)"
                        class="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm text-blue-700">
                  {{ selectedColors.some(c => c.hex === color.hex) ? 'Remove' : 'Select' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center space-x-6 mt-12 mb-6">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div class="flex items-center space-x-2">
          <span class="px-4 py-2 bg-blue-500 text-white rounded-lg">{{ currentPage }}</span>
          <span class="text-gray-600">of {{ totalPages }}</span>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>