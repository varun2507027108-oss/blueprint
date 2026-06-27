import httpx
import asyncio

async def test():
    url = "https://blueprint-engine-api.onrender.com/sessions/3884080f-c854-4645-a189-efde06d1b0ae"
    print(f"Requesting {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {response.headers}")
            print(f"Response Body: {response.text[:1000]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
