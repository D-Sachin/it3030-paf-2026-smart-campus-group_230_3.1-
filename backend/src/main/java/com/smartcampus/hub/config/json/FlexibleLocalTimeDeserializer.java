package com.smartcampus.hub.config.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class FlexibleLocalTimeDeserializer extends JsonDeserializer<LocalTime> {

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public LocalTime deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException {
        JsonToken token = parser.currentToken();

        if (token == JsonToken.VALUE_STRING) {
            String value = parser.getValueAsString();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }

            String trimmed = value.trim();
            try {
                return LocalTime.parse(trimmed, DateTimeFormatter.ISO_LOCAL_TIME);
            } catch (DateTimeParseException ignored) {
                try {
                    return LocalTime.parse(trimmed, HH_MM);
                } catch (DateTimeParseException ex) {
                    throw ctxt.weirdStringException(trimmed, LocalTime.class,
                            "Invalid time format. Use HH:mm or HH:mm:ss");
                }
            }
        }

        if (token == JsonToken.START_OBJECT) {
            JsonNode node = parser.getCodec().readTree(parser);
            int hour = node.path("hour").asInt(-1);
            int minute = node.path("minute").asInt(-1);
            int second = node.path("second").asInt(0);
            int nano = node.path("nano").asInt(0);

            if (hour < 0 || minute < 0) {
                throw ctxt.weirdStringException(node.toString(), LocalTime.class,
                        "Time object must include hour and minute");
            }

            try {
                return LocalTime.of(hour, minute, second, nano);
            } catch (RuntimeException ex) {
                throw ctxt.weirdStringException(node.toString(), LocalTime.class,
                        "Invalid time object values");
            }
        }

        return (LocalTime) ctxt.handleUnexpectedToken(LocalTime.class, parser);
    }
}