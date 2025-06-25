import asyncio

compilation_semaphore = asyncio.Semaphore(3)
