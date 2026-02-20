import time

_LAW_CACHE = {
    "data": None,
    "timestamp": 0
}
CACHE_TTL = 60 * 60  # 1 hour

class LawService:
    def fetch_environmental_laws(self):
        global _LAW_CACHE
        current_time = time.time()
        
        if _LAW_CACHE["data"] and (current_time - _LAW_CACHE["timestamp"] < CACHE_TTL):
            return _LAW_CACHE["data"]

        # High-quality mock data for the hackathon
        mock_data = [
            {
                "title": "Air (Prevention and Control of Pollution) Act, 1981",
                "category": "air",
                "type": "national",
                "raw_text": "An Act to provide for the prevention, control and abatement of air pollution, for the establishment, with a view to carrying out the aforesaid purposes, of Boards, for conferring on and assigning to such Boards powers and functions relating thereto and for matters connected therewith. It empowers State Pollution Control Boards to set emission standards for industrial plants and restrict the operation of certain industries in air pollution control areas.",
                "source_url": "https://cpcb.nic.in/air-pollution/"
            },
            {
                "title": "Water (Prevention and Control of Pollution) Act, 1974",
                "category": "water",
                "type": "national",
                "raw_text": "An Act to provide for the prevention and control of water pollution and the maintaining or restoring of wholesomeness of water, for the establishment, with a view to carrying out the purposes aforesaid, of Boards for the prevention and control of water pollution. The Act prohibits the discharge of pollutants into water bodies beyond a given standard, and lays down penalties for non-compliance.",
                "source_url": "https://cpcb.nic.in/water-pollution/"
            },
            {
                "title": "Environment (Protection) Act, 1986",
                "category": "regulation",
                "type": "national",
                "raw_text": "Umbrella legislation designed to provide a framework for Central Government coordination of the activities of various central and state authorities established under previous laws. It empowers the Centre to take all necessary measures to protect and improve the quality of the environment and prevent environmental pollution. It encompasses strict penalties for environmental degradation.",
                "source_url": "https://moef.gov.in/"
            },
            {
                "title": "The Paris Agreement",
                "category": "climate",
                "type": "international",
                "raw_text": "The Paris Agreement is a legally binding international treaty on climate change. It was adopted by 196 Parties at COP 21 in Paris, on 12 December 2015 and entered into force on 4 November 2016. Its goal is to limit global warming to well below 2, preferably to 1.5 degrees Celsius, compared to pre-industrial levels. To achieve this long-term temperature goal, countries aim to reach global peaking of greenhouse gas emissions as soon as possible.",
                "source_url": "https://unfccc.int/process-and-meetings/the-paris-agreement"
            },
            {
                "title": "Convention on Biological Diversity (CBD)",
                "category": "biodiversity",
                "type": "international",
                "raw_text": "The Convention on Biological Diversity (CBD) is the international legal instrument for the conservation of biological diversity, the sustainable use of its components and the fair and equitable sharing of the benefits arising out of the utilization of genetic resources. It has been ratified by 196 nations. The CBD covers all ecosystems, species, and genetic resources.",
                "source_url": "https://www.cbd.int/"
            },
            {
                "title": "Montreal Protocol",
                "category": "air",
                "type": "international",
                "raw_text": "The Montreal Protocol on Substances that Deplete the Ozone Layer is a landmark multilateral environmental agreement that regulates the production and consumption of nearly 100 man-made chemicals referred to as ozone depleting substances (ODS). When released to the atmosphere, those chemicals damage the stratospheric ozone layer, Earth's protective shield that protects humans and the environment from harmful levels of ultraviolet radiation from the sun.",
                "source_url": "https://www.unep.org/ozonaction/who-we-are/about-montreal-protocol"
            }
        ]

        _LAW_CACHE["data"] = mock_data
        _LAW_CACHE["timestamp"] = current_time
        return mock_data

law_service = LawService()
