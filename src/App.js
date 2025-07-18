import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sun, Moon, Info } from 'lucide-react';

// Sorting Algorithms - Fixed versions

/** Comb Sort */
const combSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  let gap = n;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }
    for (let i = 0; i + gap < n; i++) {
      animations.push({ type: 'compare', indices: [i, i + gap] });
      if (arr[i] > arr[i + gap]) {
        animations.push({ type: 'swap', indices: [i, i + gap] });
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
      }
    }
  }
  // mark all sorted
  for (let i = 0; i < n; i++) animations.push({ type: 'sorted', indices: [i] });
  return animations;
};

/** Cocktail Shaker Sort */
const cocktailSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  let start = 0, end = arr.length - 1, swapped = true;

  while (swapped) {
    swapped = false;
    // forward pass
    for (let i = start; i < end; i++) {
      animations.push({ type: 'compare', indices: [i, i + 1] });
      if (arr[i] > arr[i + 1]) {
        animations.push({ type: 'swap', indices: [i, i + 1] });
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    // backward pass
    for (let i = end; i > start; i--) {
      animations.push({ type: 'compare', indices: [i - 1, i] });
      if (arr[i - 1] > arr[i]) {
        animations.push({ type: 'swap', indices: [i - 1, i] });
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        swapped = true;
      }
    }
    start++;
  }
  for (let i = 0; i < arr.length; i++) animations.push({ type: 'sorted', indices: [i] });
  return animations;
};

/** Bucket Sort (integer buckets) */
const bucketSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  if (n === 0) return animations;

  const min = Math.min(...arr), max = Math.max(...arr);
  const bucketCount = Math.floor(Math.sqrt(n)) || 1;
  const range = (max - min + 1) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, () => []);

  // distribute
  arr.forEach((v, i) => {
    const idx = Math.min(bucketCount - 1, Math.floor((v - min) / range));
    animations.push({ type: 'current', indices: [i] });
    buckets[idx].push(v);
  });

  // sort each bucket via insertion and flatten
  let idx = 0;
  for (let b = 0; b < buckets.length; b++) {
    const bucket = buckets[b];
    // insertion sort on bucket
    for (let i = 1; i < bucket.length; i++) {
      let key = bucket[i], j = i - 1;
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }
    // overwrite back to arr
    for (let v of bucket) {
      animations.push({ type: 'overwrite', indices: [idx], value: v });
      arr[idx++] = v;
    }
  }

  for (let i = 0; i < n; i++) animations.push({ type: 'sorted', indices: [i] });
  return animations;
};

/** Radix Sort (LSD, non-negative ints) */
const radixSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  if (n === 0) return animations;
  const max = Math.max(...arr);
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    const output = Array(n).fill(0);
    const count = Array(10).fill(0);

    // count digits
    for (let i = 0; i < n; i++) {
      const digit = Math.floor((arr[i] / exp) % 10);
      count[digit]++;
      animations.push({ type: 'current', indices: [i] });
    }
    // cumulative
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    // build output
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor((arr[i] / exp) % 10);
      const pos = --count[digit];
      output[pos] = arr[i];
    }
    // copy back
    for (let i = 0; i < n; i++) {
      animations.push({ type: 'overwrite', indices: [i], value: output[i] });
      arr[i] = output[i];
    }
    exp *= 10;
  }

  for (let i = 0; i < n; i++) animations.push({ type: 'sorted', indices: [i] });
  return animations;
};

const bubbleSort = async (arr) => {
  const animations = [];
  arr = [...arr]; // Create a copy to avoid modifying original
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push({ type: 'compare', indices: [j, j + 1] });
      if (arr[j] > arr[j + 1]) {
        animations.push({ type: 'swap', indices: [j, j + 1] });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    animations.push({ type: 'sorted', indices: [n - i - 1] });
  }
  animations.push({ type: 'sorted', indices: [0] });
  return animations;
};

const insertionSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    animations.push({ type: 'current', indices: [i] });
    
    while (j >= 0 && arr[j] > key) {
      animations.push({ type: 'compare', indices: [j, j + 1] });
      animations.push({ type: 'swap', indices: [j, j + 1] });
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    animations.push({ type: 'placed', indices: [j + 1] });
  }
  
  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    animations.push({ type: 'sorted', indices: [i] });
  }
  return animations;
};

const selectionSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    animations.push({ type: 'current', indices: [i] });
    
    for (let j = i + 1; j < n; j++) {
      animations.push({ type: 'compare', indices: [minIdx, j] });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    
    if (minIdx !== i) {
      animations.push({ type: 'swap', indices: [i, minIdx] });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    animations.push({ type: 'sorted', indices: [i] });
  }
  animations.push({ type: 'sorted', indices: [n - 1] });
  return animations;
};

const mergeSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  
  const merge = (left, mid, right) => {
    const leftArr = [];
    const rightArr = [];
    
    // Copy data to temp arrays
    for (let i = left; i <= mid; i++) {
      leftArr.push(arr[i]);
    }
    for (let i = mid + 1; i <= right; i++) {
      rightArr.push(arr[i]);
    }
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      animations.push({ type: 'compare', indices: [k, k] });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        animations.push({ type: 'overwrite', indices: [k], value: leftArr[i] });
        i++;
      } else {
        arr[k] = rightArr[j];
        animations.push({ type: 'overwrite', indices: [k], value: rightArr[j] });
        j++;
      }
      k++;
    }
    
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      animations.push({ type: 'overwrite', indices: [k], value: leftArr[i] });
      i++;
      k++;
    }
    
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      animations.push({ type: 'overwrite', indices: [k], value: rightArr[j] });
      j++;
      k++;
    }
  };
  
  const mergeSortHelper = (left, right) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }
  };
  
  mergeSortHelper(0, arr.length - 1);
  
  // Mark all as sorted
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: 'sorted', indices: [i] });
  }
  return animations;
};

const quickSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  
  const partition = (low, high) => {
    const pivot = arr[high];
    animations.push({ type: 'pivot', indices: [high] });
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      animations.push({ type: 'compare', indices: [j, high] });
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          animations.push({ type: 'swap', indices: [i, j] });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
    }
    
    animations.push({ type: 'swap', indices: [i + 1, high] });
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  };
  
  const quickSortHelper = (low, high) => {
    if (low < high) {
      const pi = partition(low, high);
      animations.push({ type: 'sorted', indices: [pi] });
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  };
  
  quickSortHelper(0, arr.length - 1);
  
  // Mark all as sorted
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: 'sorted', indices: [i] });
  }
  return animations;
};

const heapSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  
  const heapify = (size, rootIdx) => {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;
    
    if (left < size) {
      animations.push({ type: 'compare', indices: [left, largest] });
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }
    
    if (right < size) {
      animations.push({ type: 'compare', indices: [right, largest] });
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }
    
    if (largest !== rootIdx) {
      animations.push({ type: 'swap', indices: [rootIdx, largest] });
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
      heapify(size, largest);
    }
  };
  
  // Build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    animations.push({ type: 'swap', indices: [0, i] });
    [arr[0], arr[i]] = [arr[i], arr[0]];
    animations.push({ type: 'sorted', indices: [i] });
    heapify(i, 0);
  }
  
  animations.push({ type: 'sorted', indices: [0] });
  return animations;
};

const shellSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const n = arr.length;
  
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      animations.push({ type: 'current', indices: [i] });
      
      while (j >= gap && arr[j - gap] > temp) {
        animations.push({ type: 'compare', indices: [j, j - gap] });
        animations.push({ type: 'swap', indices: [j, j - gap] });
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
      animations.push({ type: 'placed', indices: [j] });
    }
  }
  
  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    animations.push({ type: 'sorted', indices: [i] });
  }
  return animations;
};

const countingSort = async (arr) => {
  const animations = [];
  arr = [...arr];
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const count = Array(range).fill(0);
  
  // Count occurrences
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: 'current', indices: [i] });
    count[arr[i] - min]++;
  }
  
  // Reconstruct array
  let idx = 0;
  for (let i = 0; i < range; i++) {
    while (count[i] > 0) {
      animations.push({ type: 'overwrite', indices: [idx], value: i + min });
      arr[idx] = i + min;
      idx++;
      count[i]--;
    }
  }
  
  // Mark all as sorted
  for (let i = 0; i < arr.length; i++) {
    animations.push({ type: 'sorted', indices: [i] });
  }
  return animations;
};

// Algorithm metadata
const algorithms = {
  bubble: {
    name: 'Bubble Sort',
    func: bubbleSort,
    timeComplexity: 'O(n²) avg, O(n) best',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly swap adjacent out‑of‑order items until the list is sorted'
  },
  insertion: {
    name: 'Insertion Sort',
    func: insertionSort,
    timeComplexity: 'O(n²) avg, O(n) best',
    spaceComplexity: 'O(1)',
    description: 'Build the sorted list one element at a time by inserting into the correct position'
  },
  selection: {
    name: 'Selection Sort',
    func: selectionSort,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Select the minimum element in each pass and move it to its final spot'
  },
  merge: {
    name: 'Merge Sort',
    func: mergeSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Recursively split the array and merge sorted halves back together'
  },
  quick: {
    name: 'Quick Sort',
    func: quickSort,
    timeComplexity: 'O(n log n) avg, O(n²) worst',
    spaceComplexity: 'O(log n)',
    description: 'Partition around a pivot then recursively sort subarrays'
  },
  heap: {
    name: 'Heap Sort',
    func: heapSort,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Build a max‑heap and repeatedly extract the largest element'
  },
  shell: {
    name: 'Shell Sort',
    func: shellSort,
    timeComplexity: '≈ O(n^(3/2))',
    spaceComplexity: 'O(1)',
    description: 'Perform insertion sort with a decreasing gap sequence'
  },
  counting: {
    name: 'Counting Sort',
    func: countingSort,
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    description: 'Count the frequency of each value and rebuild the array'
  },
  comb: {
    name: 'Comb Sort',
    func: combSort,
    timeComplexity: 'O(n²) worst, better in practice than bubble',
    spaceComplexity: 'O(1)',
    description: 'Reduce gaps over passes to eliminate small values faster'
  },
  cocktail: {
    name: 'Cocktail Shaker Sort',
    func: cocktailSort,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Bidirectional bubble sort that alternates forward and backward passes'
  },
  bucket: {
    name: 'Bucket Sort',
    func: bucketSort,
    timeComplexity: 'O(n + k) avg, O(n²) worst',
    spaceComplexity: 'O(n + k)',
    description: 'Distribute elements into buckets then sort each bucket individually'
  },
  radix: {
    name: 'Radix Sort',
    func: radixSort,
    timeComplexity: 'O(d·(n + b))',
    spaceComplexity: 'O(n + b)',
    description: 'Sort numbers by processing digits least‑significant first'
  }
};



// Bar Component
function Bar({ value, maxValue, state = {}, darkMode, arraySize }) {
  const height = Math.max(20, (value / maxValue) * 450);
  const minWidth = arraySize <= 30 ? 35 : arraySize <= 50 ? 25 : arraySize <= 70 ? 18 : 12;
  const width = Math.max(minWidth, Math.floor(window.innerWidth * 0.8 / arraySize));
  
  let bg = darkMode ? 'bg-blue-400' : 'bg-blue-500';
  if (state.isComparing) bg = darkMode ? 'bg-yellow-400' : 'bg-yellow-500';
  else if (state.isSwapping) bg = darkMode ? 'bg-red-400' : 'bg-red-500';
  else if (state.isPivot) bg = darkMode ? 'bg-purple-400' : 'bg-purple-500';
  else if (state.isCurrent) bg = darkMode ? 'bg-pink-400' : 'bg-pink-500';
  else if (state.isSorted) bg = darkMode ? 'bg-green-400' : 'bg-green-500';
  
  const fontSize = arraySize <= 30 ? 'text-sm' : arraySize <= 50 ? 'text-xs' : 'text-xs';
  
  return (
    <div
      className={`${bg} transition-all duration-300 ease-in-out rounded-t-sm flex items-end justify-center ${fontSize} text-white font-bold mx-1`}
      style={{ height: `${height}px`, width: `${width}px`, minWidth: `${minWidth}px` }}
    >
      {arraySize <= 80 ? value : ''}
    </div>
  );
}

// Main Component
export default function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [originalArray, setOriginalArray] = useState([]);
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(100);
  const [algoKey, setAlgoKey] = useState('bubble');
  const [dark, setDark] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [statesMap, setStatesMap] = useState({});
  const [animations, setAnimations] = useState([]);
  const [stepMode, setStepMode] = useState(false);
  const [step, setStep] = useState(0);
  const pauseRef = useRef(false);
  const animationRef = useRef(null);
  const stopSortingRef = useRef(false);

  // Generate random array
  const generate = () => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 300) + 10);
    setArray([...arr]);
    setOriginalArray([...arr]);
    setStatesMap({});
    setAnimations([]);
    setStep(0);
    setAnimating(false);
    setPaused(false);
  };

  // Reset to original array
  const reset = () => {
    stopSortingRef.current = true; // Stop any ongoing sorting
    setArray([...originalArray]);
    setStatesMap({});
    setAnimations([]);
    setStep(0);
    setAnimating(false);
    setPaused(false);
    pauseRef.current = false;
  };

  useEffect(generate, [size]);

  // Apply single animation with proper state management
  const applyAnimation = (animation) => {
    const { type, indices, value } = animation;
    
    // Only update visual array for display, don't modify the actual sorting array
    setArray(prevArray => {
      const newArray = [...prevArray];
      
      // Handle array modifications for visualization only
      if (type === 'swap' && indices.length === 2) {
        [newArray[indices[0]], newArray[indices[1]]] = [newArray[indices[1]], newArray[indices[0]]];
      } else if (type === 'overwrite' && value !== undefined) {
        newArray[indices[0]] = value;
      }
      
      return newArray;
    });
    
    // Handle visual states
    setStatesMap(prevStates => {
      const newStates = {};
      
      // Initialize all indices with existing sorted states
      for (let i = 0; i < array.length; i++) {
        newStates[i] = { 
          isSorted: prevStates[i]?.isSorted || false 
        };
      }
      
      // Apply new states based on animation type
      if (type === 'compare') {
        indices.forEach(i => {
          if (i >= 0 && i < array.length) {
            newStates[i].isComparing = true;
          }
        });
      } else if (type === 'swap') {
        indices.forEach(i => {
          if (i >= 0 && i < array.length) {
            newStates[i].isSwapping = true;
          }
        });
      } else if (type === 'pivot') {
        indices.forEach(i => {
          if (i >= 0 && i < array.length) {
            newStates[i].isPivot = true;
          }
        });
      } else if (type === 'current') {
        indices.forEach(i => {
          if (i >= 0 && i < array.length) {
            newStates[i].isCurrent = true;
          }
        });
      } else if (type === 'sorted') {
        indices.forEach(i => {
          if (i >= 0 && i < array.length) {
            newStates[i].isSorted = true;
          }
        });
      }
      
      return newStates;
    });
  };

  // Play all animations
  const playAll = async (animationList) => {
    for (let i = 0; i < animationList.length; i++) {
      // Check if sorting should stop
      if (stopSortingRef.current) {
        setAnimating(false);
        setPaused(false);
        return;
      }
      
      if (pauseRef.current) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!pauseRef.current || stopSortingRef.current) {
              resolve();
            } else {
              setTimeout(checkPause, 100);
            }
          };
          checkPause();
        });
      }
      
      // Double-check after pause
      if (stopSortingRef.current) {
        setAnimating(false);
        setPaused(false);
        return;
      }
      
      applyAnimation(animationList[i]);
      setStep(i + 1);
      
      if (i < animationList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 301 - speed));
      }
    }
    
    setAnimating(false);
    setPaused(false);
  };

  // Start sorting
  const start = async () => {
    if (animating) return;
    
    setAnimating(true);
    stopSortingRef.current = false; // Reset the stop flag
    setPaused(false);
    pauseRef.current = false;
    setStatesMap({});
    setStep(0);
    
    try {
      const arrayToSort = [...array];
      const animationList = await algorithms[algoKey].func(arrayToSort);
      setAnimations(animationList);
      
      if (!stepMode) {
        await playAll(animationList);
      }
    } catch (error) {
      console.error('Sorting error:', error);
      setAnimating(false);
    }
  };

  // Compare all algorithms
  const compareAll = async () => {
    if (animating) return;
    
    const results = [];
    const testArray = [...originalArray];
    
    for (const [key, algo] of Object.entries(algorithms)) {
      try {
        const arrayToSort = [...testArray];
        const startTime = performance.now();
        const animationList = await algo.func(arrayToSort);
        const endTime = performance.now();
        
        const timeTaken = (endTime - startTime).toFixed(2);
        results.push(`${algo.name}: ${timeTaken}ms (${animationList.length} operations)`);
      } catch (error) {
        results.push(`${algo.name}: Error - ${error.message}`);
      }
    }
    
    alert(results.join('\n'));
  };

  // Step mode controls
  const nextStep = () => {
    if (step < animations.length) {
      applyAnimation(animations[step]);
      setStep(step + 1);
    }
  };

  const currentAlgo = algorithms[algoKey];
  const maxVal = Math.max(...array);

  return (
    <div className={`w-full h-screen flex flex-col overflow-hidden transition-colors duration-300 ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>      
      {/* Navbar */}
      <nav className={`${dark ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 flex justify-between items-center flex-shrink-0`}>
        <h1 className="text-4xl font-bold">Visualizer: Sorting Algorithms</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setDark(d => !d)} className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            {dark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button 
            onClick={() => setStepMode(m => !m)} 
            className={`p-3 rounded-lg text-lg ${stepMode ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Step Mode
          </button>
        </div>
      </nav>

      {/* Controls */}
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${dark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        <div className="flex flex-wrap items-center gap-6 w-full">
          <div>
            <label className="block text-lg font-medium mb-2">Algorithm</label>
            <select
              value={algoKey}
              onChange={e => setAlgoKey(e.target.value)}
              disabled={animating}
              className={`px-4 py-3 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              {Object.entries(algorithms).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Size: {size}</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={size} 
              onChange={e => setSize(+e.target.value)} 
              disabled={animating} 
              className="w-48 h-2" 
            />
          </div>
          
          <div>
            <label className="block text-lg font-medium mb-2">Speed: {speed}ms</label>
            <input 
              type="range" 
              min="1" 
              max="300" 
              value={speed} 
              onChange={e => setSpeed(+e.target.value)} 
              className="w-48 h-2" 
            />
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={generate} 
              disabled={animating} 
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg transition-colors"
            >
              Generate
            </button>
            <button 
              onClick={start} 
              disabled={animating && !paused} 
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg flex items-center transition-colors"
            >
              <Play className="mr-2" size={20}/>Start
            </button>
            {animating && (
              <button 
                onClick={() => { 
                  setPaused(p => !p); 
                  pauseRef.current = !pauseRef.current; 
                }} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 text-lg rounded-lg flex items-center transition-colors"
              >
                {paused ? <Play className="mr-2" size={20}/> : <Pause className="mr-2" size={20}/>}
                {paused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button 
              onClick={reset} 
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-lg rounded-lg flex items-center transition-colors"
            >
              <RotateCcw className="mr-2" size={20}/>Reset
            </button>
            <button 
              onClick={compareAll}
              disabled={animating} 
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg transition-colors"
            >
              Compare All
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} p-6 border-b ${dark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        <div className="w-full">
          <div className="flex items-center space-x-6 text-lg">
            <span><strong>Time:</strong> {currentAlgo.timeComplexity}</span>
            <span><strong>Space:</strong> {currentAlgo.spaceComplexity}</span>
            <span><strong>Description:</strong> {currentAlgo.description}</span>
          </div>
        </div>
      </div>

      {/* Step Mode Controls */}
      {stepMode && (
        <div className="p-6 text-center flex-shrink-0">
          <button 
            onClick={nextStep} 
            disabled={step >= animations.length} 
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-6 py-3 text-lg rounded-lg transition-colors"
          >
            Next Step ({step}/{animations.length})
          </button>
        </div>
      )}

      {/* Visualization */}
      <div className="flex-1 flex-shrink-0 flex flex-col justify-start items-center overflow-hidden px-4 py-4">
        <div className="flex items-end justify-center w-full h-3/4 overflow-x-auto">
          <div className="flex items-end justify-center min-h-full">
            {array.map((value, index) => (
              <Bar 
                key={`${index}-${value}`}
                value={value} 
                maxValue={maxVal} 
                state={statesMap[index] || {}} 
                darkMode={dark} 
                arraySize={array.length} 
              />
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-8 w-full max-w-4xl">
          <h3 className="text-xl font-medium mb-4 text-center"></h3>
          <h3 className="text-xl font-medium mb-4 text-center"></h3>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-blue-400' : 'bg-blue-500'} rounded`}></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-yellow-400' : 'bg-yellow-500'} rounded`}></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-red-400' : 'bg-red-500'} rounded`}></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-purple-400' : 'bg-purple-500'} rounded`}></div>
              <span>Pivot</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-pink-400' : 'bg-pink-500'} rounded`}></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${dark ? 'bg-green-400' : 'bg-green-500'} rounded`}></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {animating && (
        <div className="p-6 text-center flex-shrink-0">
          <p className="text-2xl font-semibold">{paused ? 'Paused' : 'Sorting'}: {currentAlgo.name}</p>
          <p className="text-lg opacity-75 mt-2">Step {step} of {animations.length}</p>
        </div>
      )}

      {/* Footer */}
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} p-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        <div className="w-full text-center">
          <p className="text-lg font-medium">Made with ❤️ by Anushka</p>
        </div>
      </div>
    </div>
  );
}