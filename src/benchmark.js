import axios from 'axios';
import fetch from 'node-fetch';
import got from 'got';
import superagent from 'superagent';
import needle from 'needle';
import stats from 'stats-lite';
import { performance } from 'perf_hooks';
import fs from 'fs';

const TEST_URL = 'http://localhost:3000/posts/1'; // Mock 서버 URL
const ITERATIONS = 10000; // 작업 횟수
const OUTPUT_FILE = 'benchmark_results.csv'; // 결과 파일 이름

async function measureTime(fn) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

async function axiosRequest() {
  await axios.get(TEST_URL);
}

async function fetchRequest() {
  await fetch(TEST_URL);
}

async function gotRequest() {
  await got(TEST_URL);
}

async function superagentRequest() {
  await superagent.get(TEST_URL);
}

async function needleRequest() {
  await needle('get', TEST_URL);
}

async function benchmarkLibrary(libraryName, requestFn) {
  console.log(`\nBenchmarking ${libraryName}...`);
  const times = [];
  for (let i = 0; i < ITERATIONS; i++) {
    if (i % 1000 === 0 && i !== 0) {
      console.log(`  ${libraryName}: ${i} iterations completed`);
    }
    times.push(await measureTime(requestFn));
  }

  const mean = stats.mean(times).toFixed(2);
  const stdDev = stats.stdev(times).toFixed(2);

  console.log(`  ${libraryName} - Average: ${mean} ms, Std Dev: ${stdDev} ms`);
  return { libraryName, mean, stdDev };
}

async function benchmark() {
  console.log(`Starting benchmark with ${ITERATIONS} iterations...\n`);

  const results = [];
  results.push(await benchmarkLibrary('Superagent', superagentRequest));
  results.push(await benchmarkLibrary('Needle', needleRequest));
  results.push(await benchmarkLibrary('Fetch', fetchRequest));
  results.push(await benchmarkLibrary('Got', gotRequest));
  results.push(await benchmarkLibrary('Axios', axiosRequest));

  // Save results to CSV
  const csvContent = [
    'Library,Average (ms),Std Dev (ms)',
    ...results.map(res => `${res.libraryName},${res.mean},${res.stdDev}`),
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, csvContent);
  console.log(`\nBenchmark results saved to ${OUTPUT_FILE}`);
}

benchmark().catch(err => {
  console.error('An error occurred during the benchmark:', err);
});

