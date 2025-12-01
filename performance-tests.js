import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<800'],
  }
};

const BASE_URL = 'https://mediremind.me';

export default function () {
  let addMedicineRes = http.get(`${BASE_URL}/add-medicine`);
  check(addMedicineRes, {
    'TC09: status is 200': (r) => r.status === 200,
    'TC09: response < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);

  let medicinesRes = http.get(`${BASE_URL}/medicines`);
  check(medicinesRes, {
    'TC10: status is 200': (r) => r.status === 200,
    'TC10: response < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);
}
